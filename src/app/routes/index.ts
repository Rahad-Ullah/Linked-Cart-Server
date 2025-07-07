import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { BannerRoutes } from '../modules/banner/banner.routes';
import { CategoryRoutes } from '../modules/category/category.route';
import { ProductRoutes } from '../modules/product/product.routes';
import { RuleRoutes } from '../modules/rule/rule.route';
import { FaqRoutes } from '../modules/faq/faq.route';
import { OrderRoutes } from '../modules/order/order.routes';
import { CartRoutes } from '../modules/cart/cart.routes';
import { ChatRoutes } from '../modules/chat/chat.routes';
import { MessageRoutes } from '../modules/message/message.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { OfferRoutes } from '../modules/offer/offer.route';
import { WalletRoutes } from '../modules/wallet/wallet.route';
import { ReviewRoutes } from '../modules/review/review.routes';
import { DashboardRoutes } from '../modules/dashboard/dashboard.route';
import { BookmarkRoutes } from '../modules/bookmark/bookmark.routes';
import { Chat2Routes } from "../modules/chat2/chat2.route";
const router = express.Router();

const apiRoutes = [
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/banner", route: BannerRoutes },
  { path: "/category", route: CategoryRoutes },
  { path: "/product", route: ProductRoutes },
  { path: "/rule", route: RuleRoutes },
  { path: "/faq", route: FaqRoutes },
  { path: "/order", route: OrderRoutes },
  { path: "/cart", route: CartRoutes },
  { path: "/chat", route: ChatRoutes },
  { path: "/chat2", route: Chat2Routes },
  { path: "/message", route: MessageRoutes },
  { path: "/notification", route: NotificationRoutes },
  { path: "/offer", route: OfferRoutes },
  { path: "/wallet", route: WalletRoutes },
  { path: "/review", route: ReviewRoutes },
  { path: "/dashboard", route: DashboardRoutes },
  { path: "/bookmark", route: BookmarkRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;