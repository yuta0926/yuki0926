import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { Link } from "react-router";

import { WineBadge } from "../../../components/common/WineBadge";
import { designTokens } from "../../../theme/theme";

import { formatPrice } from "../utils/formatPrice";

import type { WineCustomer } from "../types/wine";


type CustomerWineTableViewProps = {
  wines: WineCustomer[];
};


export function CustomerWineTableView({
  wines,
}: CustomerWineTableViewProps) {
  if (wines.length === 0) {
    return (
      <div className="rounded-xl border border-app-border bg-app-surface px-6 py-16 text-center text-app-text-secondary">
        条件に一致するワインがありません。
      </div>
    );
  }

  return (
    <TableContainer>
      <Table stickyHeader aria-label="ワイン一覧">
        <TableHead>
          <TableRow>
            <TableCell>ワイン名</TableCell>
            <TableCell>種類</TableCell>
            <TableCell>スタイル</TableCell>
            <TableCell>生産者</TableCell>
            <TableCell>生産国</TableCell>
            <TableCell align="center">Vintage</TableCell>
            <TableCell align="right">価格</TableCell>
            <TableCell align="center">在庫</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {wines.map((wine) => (
            <TableRow key={wine.id} hover>
              <TableCell sx={{ minWidth: 220 }}>
                <Link
                  to={`/wines/${wine.id}`}
                  className="font-medium text-app-text transition-colors hover:text-app-primary hover:underline"
                >
                  {wine.name}
                </Link>
              </TableCell>

              <TableCell>
                <WineBadge value={wine.wine_type} />
              </TableCell>

              <TableCell>
                <WineBadge value={wine.style_type} />
              </TableCell>

              <TableCell>{wine.producer ?? "-"}</TableCell>
              <TableCell>{wine.country ?? "-"}</TableCell>
              <TableCell align="center">{wine.vintage ?? "-"}</TableCell>

              <TableCell align="right">
                {formatPrice(wine.sale_price)}
              </TableCell>

              <TableCell align="center">
                <Chip
                  label={wine.in_stock ? "在庫あり" : "在庫なし"}
                  variant="outlined"
                  size="small"
                  sx={{
                    color: wine.in_stock
                      ? designTokens.colors.success
                      : designTokens.colors.textMuted,
                    borderColor: wine.in_stock
                      ? designTokens.colors.success
                      : designTokens.colors.border,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
