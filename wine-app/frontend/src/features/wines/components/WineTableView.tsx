import {
  useState,
} from "react";

import {
  DeleteOutlineOutlined,
  EditOutlined,
  MoreHoriz,
} from "@mui/icons-material";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";

import {
  Link,
  useNavigate,
} from "react-router";

import {
  WineBadge,
} from "../../../components/common/WineBadge";

import { useDeleteWine } from "../hooks/useWines";
import { formatPrice } from "../utils/formatPrice";

import type {
  Wine,
} from "../types/wine";


type WineTableViewProps = {
  wines: Wine[];
};


export function WineTableView({
  wines,
}: WineTableViewProps) {
  const navigate = useNavigate();
  const deleteWineMutation = useDeleteWine();

  const [menuState, setMenuState] = useState<{
    anchorEl: HTMLElement;
    wine: Wine;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Wine | null>(null);

  function closeMenu() {
    setMenuState(null);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    deleteWineMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }

  if (wines.length === 0) {
    return (
      <div className="rounded-xl border border-app-border bg-app-surface px-6 py-16 text-center text-app-text-secondary">
        条件に一致するワインがありません。
      </div>
    );
  }

  return (
    <TableContainer>
      <Table
        stickyHeader
        aria-label="ワイン一覧"
      >
        <TableHead>
          <TableRow>
            <TableCell>
              ワイン名
            </TableCell>

            <TableCell>
              種類
            </TableCell>

            <TableCell>
              スタイル
            </TableCell>

            <TableCell>
              生産者
            </TableCell>

            <TableCell>
              生産国
            </TableCell>

            <TableCell align="center">
              Vintage
            </TableCell>

            <TableCell align="right">
              仕入れ価格
            </TableCell>

            <TableCell align="right">
              売価
            </TableCell>

            <TableCell align="right">
              在庫本数
            </TableCell>

            <TableCell>
              保管場所
            </TableCell>

            <TableCell align="center">
              アクション
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {wines.map((wine) => (
            <TableRow
              key={wine.id}
              hover
            >
              <TableCell
                sx={{
                  minWidth: 220,
                }}
              >
                <Link
                  to={`/admin/wines/${wine.id}`}
                  className="font-medium text-app-text transition-colors hover:text-app-primary hover:underline"
                >
                  {wine.name}
                </Link>
              </TableCell>

              <TableCell>
                <WineBadge
                  value={wine.wine_type}
                />
              </TableCell>

              <TableCell>
                <WineBadge
                  value={wine.style_type}
                />
              </TableCell>

              <TableCell>
                {wine.producer ?? "-"}
              </TableCell>

              <TableCell>
                {wine.country ?? "-"}
              </TableCell>

              <TableCell align="center">
                {wine.vintage ?? "-"}
              </TableCell>

              <TableCell align="right">
                {formatPrice(
                  wine.purchase_price,
                )}
              </TableCell>

              <TableCell align="right">
                {formatPrice(
                  wine.sale_price,
                )}
              </TableCell>

              <TableCell align="right">
                {wine.quantity}
              </TableCell>

              <TableCell>
                {wine.location ?? "-"}
              </TableCell>

              <TableCell align="center">
                <Tooltip title="操作">
                  <IconButton
                    size="small"
                    aria-label={`${wine.name}の操作`}
                    onClick={(event) =>
                      setMenuState({
                        anchorEl: event.currentTarget,
                        wine,
                      })
                    }
                  >
                    <MoreHoriz />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu
        anchorEl={menuState?.anchorEl}
        open={Boolean(menuState)}
        onClose={closeMenu}
      >
        <MenuItem
          onClick={() => {
            if (menuState) {
              navigate(`/admin/wines/${menuState.wine.id}/edit`);
            }

            closeMenu();
          }}
        >
          <ListItemIcon>
            <EditOutlined fontSize="small" />
          </ListItemIcon>

          <ListItemText primary="編集" />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (menuState) {
              setDeleteTarget(menuState.wine);
            }

            closeMenu();
          }}
        >
          <ListItemIcon>
            <DeleteOutlineOutlined fontSize="small" />
          </ListItemIcon>

          <ListItemText primary="削除" />
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle>ワインを削除しますか?</DialogTitle>

        <DialogContent>
          <DialogContentText>
            「{deleteTarget?.name}」を削除します。この操作は取り消せません。
          </DialogContentText>

          {deleteWineMutation.isError && (
            <p className="mt-3 text-sm text-red-700">
              削除に失敗しました。もう一度お試しください。
            </p>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleteWineMutation.isPending}
          >
            キャンセル
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
            disabled={deleteWineMutation.isPending}
          >
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
}
