import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

// TanStack Routerを使用するように変更されたため、このコンポーネントは不要になりました。
// ルートにリダイレクトします。
export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/" });
  }, [navigate]);

  return null;
}
