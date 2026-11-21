import { Router, type Request, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  getProduct,
  lessonInputSchema,
  lessonReorderSchema,
  lessonSource,
  lessonWatchUrl,
  orderStatuses,
  productSettingSchema,
  products,
  rejectOrderSchema,
  reviewActionSchema,
  type AdminLessonDto,
  type AdminStats,
  type LessonProvider,
  type AdminUserDto,
  type OrderStatus,
  type ProductSettingDto,
  type ReviewDto,
} from '@et-trader/shared';
import { requireAuth } from '../../middleware/require-auth';
import { requireAdmin } from '../../middleware/require-admin';
import { Lesson } from '../../models/Lesson';
import { Order } from '../../models/Order';
import { ProductSetting } from '../../models/ProductSetting';
import { User, isAdmin } from '../../models/User';
import { HttpError } from '../../utils/http-error';
import {
  approveOrder,
  findByReviewToken,
  rejectOrder,
  reviewTokenUsable,
  setAccessRevoked,
  toAdminOrderDto,
} from '../orders/orders.service';

export const adminRouter = Router();

const adminEmail = (req: Request) => (req as Request & { adminEmail: string }).adminEmail;
const idPattern = /^[a-f0-9]{24}$/i;

async function findOrder(id: string) {
  if (!idPattern.test(id)) throw new HttpError(404, 'Order not found.');
  const order = await Order.findById(id);
  if (!order) throw new HttpError(404, 'Order not found.');
  return order;
}

async function findUser(id: string) {
  if (!idPattern.test(id)) throw new HttpError(404, 'User not found.');
  const user = await User.findById(id);
  if (!user) throw new HttpError(404, 'User not found.');
  return user;
}

/* ─────────── Email review link (no login: the one-time token is the authorisation) ─────────── */

const reviewLimiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { message: 'Too many requests. Try again later.' } },
});

adminRouter.get('/review/:token', reviewLimiter, async (req: Request, res: Response) => {
  const order = await findByReviewToken(String(req.params.token));
  if (!order) throw new HttpError(404, 'This review link is invalid or was already used.');
  const data: ReviewDto = {
    order: await toAdminOrderDto(order),
    actionable: reviewTokenUsable(order),
  };
  res.json({ data });
});

adminRouter.post('/review/:token', reviewLimiter, async (req: Request, res: Response) => {
  const order = await findByReviewToken(String(req.params.token));
  if (!order) throw new HttpError(404, 'This review link is invalid or was already used.');
  if (!reviewTokenUsable(order))
    throw new HttpError(
      410,
      'This review link has expired. Review the order in the admin section.',
    );
  const action = reviewActionSchema.parse(req.body);
  if (action.action === 'approve') await approveOrder(order, 'email link');
  else await rejectOrder(order, action.reason, 'email link');
  res.json({ data: { order: await toAdminOrderDto(order), actionable: false } });
});

/* ─────────── Admin portal (signed-in admins only) ─────────── */

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/stats', async (_req: Request, res: Response) => {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [users, verifiedUsers, byStatus, revenue, revenue30, recent] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ emailVerified: { $ne: false } }),
    Order.aggregate<{ _id: OrderStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ total: number }>([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Order.aggregate<{ total: number }>([
      { $match: { status: 'approved', reviewedAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Order.find({ status: { $ne: 'awaiting_payment' } })
      .sort({ updatedAt: -1 })
      .limit(8),
  ]);
  const orders = Object.fromEntries(orderStatuses.map((s) => [s, 0])) as Record<
    OrderStatus,
    number
  >;
  for (const row of byStatus) orders[row._id] = row.count;
  const data: AdminStats = {
    users,
    verifiedUsers,
    orders,
    revenue: revenue[0]?.total ?? 0,
    revenueLast30Days: revenue30[0]?.total ?? 0,
    recentOrders: await Promise.all(recent.map(toAdminOrderDto)),
  };
  res.json({ data });
});

adminRouter.get('/orders', async (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : 'all';
  const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const filter: Record<string, unknown> = {};
  if (status !== 'all') {
    if (!(orderStatuses as readonly string[]).includes(status))
      throw new HttpError(422, 'Unknown status filter.');
    filter.status = status;
  }
  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const users = await User.find({ email: { $regex: safe, $options: 'i' } }).select('_id');
    filter.$or = [
      { orderNumber: { $regex: safe, $options: 'i' } },
      { accessEmail: { $regex: safe, $options: 'i' } },
      { buyerName: { $regex: safe, $options: 'i' } },
      { txHash: { $regex: safe, $options: 'i' } },
      { userId: { $in: users.map((u) => u._id) } },
    ];
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(500);
  res.json({ data: await Promise.all(orders.map(toAdminOrderDto)) });
});

adminRouter.get('/orders/:id', async (req: Request, res: Response) => {
  res.json({ data: await toAdminOrderDto(await findOrder(String(req.params.id))) });
});

adminRouter.post('/orders/:id/approve', async (req: Request, res: Response) => {
  const order = await approveOrder(await findOrder(String(req.params.id)), adminEmail(req));
  res.json({ data: await toAdminOrderDto(order) });
});

adminRouter.post('/orders/:id/reject', async (req: Request, res: Response) => {
  const { reason } = rejectOrderSchema.parse(req.body);
  const order = await rejectOrder(await findOrder(String(req.params.id)), reason, adminEmail(req));
  res.json({ data: await toAdminOrderDto(order) });
});

adminRouter.post('/orders/:id/revoke', async (req: Request, res: Response) => {
  const order = await setAccessRevoked(await findOrder(String(req.params.id)), true);
  res.json({ data: await toAdminOrderDto(order) });
});

adminRouter.post('/orders/:id/restore', async (req: Request, res: Response) => {
  const order = await setAccessRevoked(await findOrder(String(req.params.id)), false);
  res.json({ data: await toAdminOrderDto(order) });
});

adminRouter.get('/users', async (_req: Request, res: Response) => {
  const [users, totals] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(1000),
    Order.aggregate<{ _id: unknown; orders: number; approved: number; spent: number }>([
      {
        $group: {
          _id: '$userId',
          orders: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          spent: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] } },
        },
      },
    ]),
  ]);
  const byUser = new Map(totals.map((t) => [String(t._id), t]));
  const data: AdminUserDto[] = users.map((user) => {
    const t = byUser.get(String(user._id));
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      providers: user.providers,
      emailVerified: user.emailVerified !== false,
      isAdmin: isAdmin(user),
      blocked: Boolean(user.get('blocked')),
      createdAt: new Date(user.get('createdAt')).toISOString(),
      orders: t?.orders ?? 0,
      approvedOrders: t?.approved ?? 0,
      totalSpent: t?.spent ?? 0,
    };
  });
  res.json({ data });
});

async function setBlocked(req: Request, res: Response, blocked: boolean) {
  const user = await findUser(String(req.params.id));
  if (isAdmin(user)) throw new HttpError(409, 'Admin accounts cannot be blocked.');
  user.set('blocked', blocked);
  await user.save();
  res.json({ data: { id: String(user._id), blocked } });
}

adminRouter.post('/users/:id/block', (req: Request, res: Response) => setBlocked(req, res, true));
adminRouter.post('/users/:id/unblock', (req: Request, res: Response) =>
  setBlocked(req, res, false),
);

adminRouter.get('/products', async (_req: Request, res: Response) => {
  const settings = await ProductSetting.find();
  const byId = new Map(settings.map((s) => [s.productId, s]));
  const data: ProductSettingDto[] = products.map((p) => ({
    productId: p.id,
    title: p.title,
    type: p.type,
    price: p.price,
    accessUrl: byId.get(p.id)?.accessUrl ?? '',
    accessNote: byId.get(p.id)?.accessNote ?? '',
  }));
  res.json({ data });
});

adminRouter.put('/products/:productId', async (req: Request, res: Response) => {
  const product = getProduct(String(req.params.productId));
  if (!product) throw new HttpError(404, 'Unknown product.');
  const values = productSettingSchema.parse(req.body);
  const setting = await ProductSetting.findOneAndUpdate(
    { productId: product.id },
    { $set: values },
    { upsert: true, new: true },
  );
  const data: ProductSettingDto = {
    productId: product.id,
    title: product.title,
    type: product.type,
    price: product.price,
    accessUrl: setting.accessUrl,
    accessNote: setting.accessNote,
  };
  res.json({ data });
});

/* ─────────── Course lessons (video) ─────────── */

type LessonDoc = InstanceType<typeof Lesson>;

const adminLessonDto = (lesson: LessonDoc): AdminLessonDto => {
  const provider = lesson.get('provider') as LessonProvider;
  return {
    id: String(lesson._id),
    productId: lesson.get('productId'),
    title: lesson.get('title'),
    order: lesson.get('order'),
    provider,
    videoUrl: lessonWatchUrl(provider, lesson.get('sourceId')),
  };
};

function requireCourse(productId: string) {
  const product = getProduct(productId);
  if (!product || product.type !== 'course') throw new HttpError(404, 'Course not found.');
  return product;
}

async function findLesson(id: string) {
  if (!idPattern.test(id)) throw new HttpError(404, 'Lesson not found.');
  const lesson = await Lesson.findById(id);
  if (!lesson) throw new HttpError(404, 'Lesson not found.');
  return lesson;
}

const lessonsOf = (productId: string) =>
  Lesson.find({ productId }).sort({ order: 1, createdAt: 1 });

adminRouter.get('/products/:productId/lessons', async (req: Request, res: Response) => {
  const product = requireCourse(String(req.params.productId));
  const lessons = await lessonsOf(product.id);
  res.json({ data: lessons.map(adminLessonDto) });
});

adminRouter.post('/products/:productId/lessons', async (req: Request, res: Response) => {
  const product = requireCourse(String(req.params.productId));
  const { title, videoUrl } = lessonInputSchema.parse(req.body);
  const source = lessonSource(videoUrl)!;
  const last = await Lesson.findOne({ productId: product.id }).sort({ order: -1 });
  const lesson = await Lesson.create({
    productId: product.id,
    title,
    provider: source.provider,
    sourceId: source.id,
    order: (last?.get('order') ?? -1) + 1,
  });
  res.status(201).json({ data: adminLessonDto(lesson) });
});

adminRouter.put('/lessons/:id', async (req: Request, res: Response) => {
  const lesson = await findLesson(String(req.params.id));
  const { title, videoUrl } = lessonInputSchema.parse(req.body);
  const source = lessonSource(videoUrl)!;
  lesson.set({ title, provider: source.provider, sourceId: source.id });
  await lesson.save();
  res.json({ data: adminLessonDto(lesson) });
});

adminRouter.delete('/lessons/:id', async (req: Request, res: Response) => {
  const lesson = await findLesson(String(req.params.id));
  await lesson.deleteOne();
  res.json({ data: { id: String(lesson._id) } });
});

adminRouter.put('/products/:productId/lessons/reorder', async (req: Request, res: Response) => {
  const product = requireCourse(String(req.params.productId));
  const { ids } = lessonReorderSchema.parse(req.body);
  await Promise.all(
    ids.map((id, index) =>
      idPattern.test(id)
        ? Lesson.updateOne({ _id: id, productId: product.id }, { $set: { order: index } })
        : Promise.resolve(),
    ),
  );
  const lessons = await lessonsOf(product.id);
  res.json({ data: lessons.map(adminLessonDto) });
});
