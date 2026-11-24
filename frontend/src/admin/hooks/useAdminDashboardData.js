import { useCallback, useEffect, useState } from "react";
import { getAdminOrders } from "../services/adminOrderApi";
import { getAdminProducts } from "../services/adminProductApi";
import { getAdminCategories } from "../services/adminCategoryApi";
export const LOW_STOCK_THRESHOLD = 5;

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Ready for Pickup",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

const ACTIONABLE_ORDER_STATUSES = new Set([
  "Pending",
  "Processing",
  "Ready for Pickup",
]);

function extractTotal(pagination, fallbackLength) {
  return (
    pagination?.total ??
    pagination?.totalItems ??
    pagination?.totalOrders ??
    pagination?.totalProducts ??
    fallbackLength
  );
}

function buildEmptyState() {
  return {
    metrics: {
      paidRevenue: 0,
      totalOrders: 0,
      ordersNeedingAction: 0,
      paymentExceptions: 0,
      totalProducts: 0,
      activeProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalCategories: 0,
    },
    orderStatusCounts: Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])),
    paymentStatusCounts: Object.fromEntries(
      PAYMENT_STATUSES.map((s) => [s, 0]),
    ),
    recentOrders: [],
    attentionProducts: [],
  };
}

export default function useAdminDashboardData() {
  const [data, setData] = useState(buildEmptyState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async ({ isRefresh = false } = {}) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const nextErrors = [];

    const [ordersResult, productsResult, categoriesResult] =
      await Promise.allSettled([
        getAdminOrders({ page: 1, limit: 100 }),
        getAdminProducts({ page: 1, limit: 100 }),
        getAdminCategories(),
      ]);

    const nextState = buildEmptyState();

    //  Orders & PayHere payment metrics
    if (ordersResult.status === "fulfilled") {
      const payload = ordersResult.value?.data || ordersResult.value || {};
      const orders = Array.isArray(payload.orders) ? payload.orders : [];

      nextState.metrics.totalOrders = extractTotal(
        payload.pagination,
        orders.length,
      );

      for (const order of orders) {
        const orderStatus = order.status?.orderStatus;
        const paymentStatus = order.status?.paymentStatus;
        const paymentMethod = order.methods?.paymentMethod;
        const total = Number(order.financials?.total) || 0;

        if (orderStatus in nextState.orderStatusCounts) {
          nextState.orderStatusCounts[orderStatus] += 1;
        }

        if (paymentStatus in nextState.paymentStatusCounts) {
          nextState.paymentStatusCounts[paymentStatus] += 1;
        }

        if (paymentStatus === "Paid" && orderStatus !== "Cancelled") {
          nextState.metrics.paidRevenue += total;
        }

        if (ACTIONABLE_ORDER_STATUSES.has(orderStatus)) {
          nextState.metrics.ordersNeedingAction += 1;
        }

        const isFailedPayment = paymentStatus === "Failed";
        const isPendingOnlinePayment =
          paymentMethod === "Online Payment" && paymentStatus === "Pending";

        if (isFailedPayment || isPendingOnlinePayment) {
          nextState.metrics.paymentExceptions += 1;
        }
      }

      nextState.recentOrders = orders.slice(0, 6);
    } else {
      nextErrors.push({
        source: "Orders",
        message: ordersResult.reason?.message || "Failed to load orders.",
      });
    }

    // Products & real inventory stock metrics
    if (productsResult.status === "fulfilled") {
      const { products = [], pagination } = productsResult.value || {};

      nextState.metrics.totalProducts = extractTotal(
        pagination,
        products.length,
      );

      const attentionList = [];

      for (const product of products) {
        const isActive = product.status === "active";
        const stock = Number(product.availableStock ?? product.stock ?? 0);

        if (isActive) {
          nextState.metrics.activeProducts += 1;

          if (stock === 0) {
            nextState.metrics.outOfStockCount += 1;
            attentionList.push(product);
          } else if (stock <= LOW_STOCK_THRESHOLD) {
            nextState.metrics.lowStockCount += 1;
            attentionList.push(product);
          }
        }
      }

      // Surface out-of-stock items first, then lowest stock
      attentionList.sort(
        (a, b) =>
          (a.availableStock ?? a.stock ?? 0) -
          (b.availableStock ?? b.stock ?? 0),
      );
      nextState.attentionProducts = attentionList.slice(0, 5);
    } else {
      nextErrors.push({
        source: "Products",
        message: productsResult.reason?.message || "Failed to load products.",
      });
    }

    // Categories count
    if (categoriesResult.status === "fulfilled") {
      const categories = Array.isArray(categoriesResult.value)
        ? categoriesResult.value
        : [];
      nextState.metrics.totalCategories = categories.length;
    } else {
      nextErrors.push({
        source: "Categories",
        message:
          categoriesResult.reason?.message || "Failed to load categories.",
      });
    }

    setData(nextState);
    setErrors(nextErrors);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    ...data,
    loading,
    refreshing,
    errors,
    lastUpdated,
    refresh: () => fetchDashboard({ isRefresh: true }),
  };
}
