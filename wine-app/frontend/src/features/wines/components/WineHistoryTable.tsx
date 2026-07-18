import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Link } from "react-router";

import { designTokens } from "../../../theme/theme";
import type { InventoryTransaction, TransactionType } from "../types/wine";


type WineHistoryTableProps = {
  transactions: InventoryTransaction[];
  viewAllHref?: string;
};


const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  in: "入庫",
  out: "出庫",
  move: "移動",
  adjust: "調整",
};


function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ja-JP");
}


function formatLocation(transaction: InventoryTransaction): string {
  if (transaction.transaction_type === "move") {
    return `${transaction.from_location ?? "-"} → ${transaction.to_location ?? "-"}`;
  }

  return transaction.to_location ?? transaction.from_location ?? "-";
}


function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const colors = designTokens.transactionType[type];

  return (
    <Chip
      label={TRANSACTION_TYPE_LABELS[type]}
      variant="outlined"
      size="small"
      sx={{
        color: colors.text,
        backgroundColor: colors.background,
        borderColor: colors.border,
      }}
    />
  );
}


export function WineHistoryTable({
  transactions,
  viewAllHref,
}: WineHistoryTableProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <div className="mb-2 flex items-center justify-between">
        <Typography variant="h2">
          入出庫履歴
        </Typography>

        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="text-sm text-app-primary hover:underline"
          >
            すべての履歴を見る
          </Link>
        )}
      </div>

      {transactions.length === 0 ? (
        <p
          className="text-sm"
          style={{ color: designTokens.colors.textMuted }}
        >
          入出庫履歴はまだありません。
        </p>
      ) : (
        <TableContainer>
          <Table aria-label="入出庫履歴" size="small">
            <TableHead>
              <TableRow>
                <TableCell>日時</TableCell>
                <TableCell>種別</TableCell>
                <TableCell align="right">数量</TableCell>
                <TableCell>保管場所</TableCell>
                <TableCell>備考</TableCell>
                <TableCell>操作ユーザー</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    {formatDateTime(transaction.transaction_at)}
                  </TableCell>

                  <TableCell>
                    <TransactionTypeBadge type={transaction.transaction_type} />
                  </TableCell>

                  <TableCell align="right">
                    {transaction.quantity}
                  </TableCell>

                  <TableCell>
                    {formatLocation(transaction)}
                  </TableCell>

                  <TableCell>
                    {transaction.note ?? "-"}
                  </TableCell>

                  <TableCell>
                    {transaction.operated_by ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
