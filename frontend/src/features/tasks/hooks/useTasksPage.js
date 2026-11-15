import { useLocation, useNavigate } from "react-router-dom";
import { useSearchQuery } from "@/shared/hooks/useSearchQuery";
import { useEntityDialog } from "@/shared/hooks/useEntityDialog";

export function useTasksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = useSearchQuery();
  const dialog = useEntityDialog();

  return {
    search,
    dialog,
    openTask: (id) => navigate(`${location.pathname}/${id}`),
    openEdit: dialog.openEdit,
  };
}
