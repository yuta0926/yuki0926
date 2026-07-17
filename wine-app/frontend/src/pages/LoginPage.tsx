import { useState, type FormEvent } from "react";

import WineBarOutlined from "@mui/icons-material/WineBarOutlined";
import {
  Alert,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  Navigate,
  useLocation,
  useNavigate,
  type Location,
} from "react-router";

import { useAuth } from "../features/auth/context/AuthContext";


type LocationState = {
  from?: Location;
};


export function LoginPage() {
  const { session, isLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && session) {
    const from = (location.state as LocationState | null)?.from;

    return (
      <Navigate
        to={from ?? "/admin/wines"}
        replace
      />
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(
        "メールアドレスまたはパスワードが正しくありません。",
      );
      return;
    }

    navigate("/admin/wines", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-background px-4">
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 5, width: "100%", maxWidth: 400 }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col items-center gap-2">
          <WineBarOutlined
            sx={{ color: "primary.main", fontSize: 40 }}
          />

          <Typography
            component="h1"
            sx={{
              fontFamily: '"Shippori Mincho", "Yu Mincho", serif',
              fontSize: 24,
              fontWeight: 600,
              color: "primary.main",
            }}
          >
            Wine Stocker
          </Typography>

          <Typography
            variant="body2"
            className="text-app-text-secondary"
          >
            管理者ログイン
          </Typography>
        </div>

        {errorMessage && (
          <Alert severity="error">{errorMessage}</Alert>
        )}

        <TextField
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoFocus
          fullWidth
        />

        <TextField
          label="パスワード"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </Button>
      </Paper>
    </div>
  );
}
