import { useLocation, useNavigate } from "react-router-dom";
import { useSearchQuery } from "@/shared/hooks/useSearchQuery";
import { useEntityDialog } from "@/shared/hooks/useEntityDialog";

export function useListsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = useSearchQuery();
  const dialog = useEntityDialog();

  return {
    search,
    dialog,
    openList: (id) => navigate(`${location.pathname}/${id}`),
    openEdit: dialog.openEdit,
  };
}
