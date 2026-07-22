import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import { useCreateWineTransaction } from "../hooks/useWines";
import type { Wine } from "../types/wine";


export type MovableTransactionType = "in" | "out" | "move";


type WineTransactionDialogProps = {
  open: boolean;
  onClose: () => void;
  wine: Wine;
  initialType: MovableTransactionType;
};


const TYPE_LABELS: Record<MovableTransactionType, string> = {
  in: "入庫",
  out: "出庫",
  move: "移動",
};


export function WineTransactionDialog({
  open,
  onClose,
  wine,
  initialType,
}: WineTransactionDialogProps) {
  const [transactionType, setTransactionType] =
    useState<MovableTransactionType>(initialType);
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  const createTransactionMutation = useCreateWineTransaction(wine.id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTransactionType(initialType);
    setQuantity(initialType === "move" ? String(wine.quantity) : "1");
    setLocation("");
    setNote("");
    createTransactionMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialType, wine.quantity]);

  const numericQuantity = Number(quantity);

  const quantityError =
    !Number.isInteger(numericQuantity) || numericQuantity <= 0
      ? "1以上の整数を入力してください。"
      : (transactionType === "out" || transactionType === "move") &&
          numericQuantity > wine.quantity
        ? `在庫数(${wine.quantity}本)を超えています。`
        : null;

  const locationError =
    transactionType === "move" && location.trim() === ""
      ? "移動先を入力してください。"
      : null;

  const moveDisabled = transactionType === "move" && wine.quantity === 0;

  const canSubmit =
    !quantityError &&
    !locationError &&
    !moveDisabled &&
    !createTransactionMutation.isPending;

  function handleTypeChange(
    _event: React.MouseEvent<HTMLElement>,
    value: MovableTransactionType | null,
  ) {
    if (!value) {
      return;
    }

    setTransactionType(value);
    setQuantity(value === "move" ? String(wine.quantity) : "1");
    setLocation("");
  }

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    createTransactionMutation.mutate(
      {
        transaction_type: transactionType,
        quantity: numericQuantity,
        from_location:
          transactionType === "out" ? location || undefined : undefined,
        to_location:
          transactionType === "in" || transactionType === "move"
            ? location || undefined
            : undefined,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>入出庫登録</DialogTitle>

      <DialogContent className="flex flex-col gap-4 pt-2">
        <ToggleButtonGroup
          value={transactionType}
          exclusive
          onChange={handleTypeChange}
          size="small"
          fullWidth
        >
          {(Object.keys(TYPE_LABELS) as MovableTransactionType[]).map(
            (type) => (
              <ToggleButton key={type} value={type}>
                {TYPE_LABELS[type]}
              </ToggleButton>
            ),
          )}
        </ToggleButtonGroup>

        <TextField
          label="数量"
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          error={!!quantityError}
          helperText={quantityError}
          slotProps={{ htmlInput: { min: 1 } }}
          fullWidth
        />

        <TextField
          label={transactionType === "out" ? "出庫元" : transactionType === "move" ? "移動先" : "入庫先"}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder={wine.location ?? undefined}
          error={!!locationError}
          helperText={locationError}
          fullWidth
        />

        <TextField
          label="備考"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          multiline
          minRows={2}
          fullWidth
        />

        {moveDisabled && (
          <Alert severity="warning">
            在庫が0本のため移動できません。
          </Alert>
        )}

        {createTransactionMutation.isError && (
          <Alert severity="error">
            登録に失敗しました。もう一度お試しください。
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={createTransactionMutation.isPending}
        >
          キャンセル
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          登録する
        </Button>
      </DialogActions>
    </Dialog>
  );
}
