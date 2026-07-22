import {
  MoreHoriz,
} from "@mui/icons-material";

import {
  IconButton,
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
} from "react-router";

import {
  WineBadge,
} from "../../../components/common/WineBadge";

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
                  >
                    <MoreHoriz />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
