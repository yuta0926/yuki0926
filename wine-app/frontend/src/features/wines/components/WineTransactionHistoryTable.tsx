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

import { designTokens } from "../../../theme/theme";
import type {
  InventoryTransactionWithWine,
  TransactionType,
} from "../types/wine";


type WineTransactionHistoryTableProps = {
  transactions: InventoryTransactionWithWine[];
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


function formatLocation(
  transaction: InventoryTransactionWithWine,
): string {
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


export function WineTransactionHistoryTable({
  transactions,
}: WineTransactionHistoryTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-app-border bg-app-surface px-6 py-16 text-center text-app-text-secondary">
        入出庫履歴はまだありません。
      </div>
    );
  }

  return (
    <TableContainer>
      <Table aria-label="入出庫履歴" size="small">
        <TableHead>
          <TableRow>
            <TableCell>日時</TableCell>
            <TableCell>ワイン名</TableCell>
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
                <Link
                  to={`/admin/wines/${transaction.wine_id}`}
                  className="text-app-primary hover:underline"
                >
                  {transaction.wine_name}
                </Link>
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
  );
}
