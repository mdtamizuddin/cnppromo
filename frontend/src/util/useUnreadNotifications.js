import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { api } from "./axios";

// Shares the same query key as the Notifications page so read/unread state
// stays in sync across the topbar badge, the sidebar badge and the page.
export const useUnreadNotifications = () => {
  const { user } = useSelector((state) => state.user);

  const { data } = useQuery({
    queryKey: ["notifications", user?._id],
    queryFn: async () => {
      const res = await api.get("/notification");
      return res.data;
    },
    enabled: !!user?._id,
    refetchInterval: 60000,
  });

  return data?.unread ?? 0;
};