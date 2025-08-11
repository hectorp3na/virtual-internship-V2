"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LoginModal from "../components/LoginModal";
import SignUpModal from "../components/SignUpModal";

export default function AuthModalRouter() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  console.log("Auth param:", sp.get("auth"), "Path:", pathname);

  const makeHref = (params: URLSearchParams) => {
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const open = (value: "login" | "signup") => {
    const next = new URLSearchParams(sp.toString());
    next.set("auth", value);
    router.replace(makeHref(next), { scroll: false });
  };

  const close = () => {
    const next = new URLSearchParams(sp.toString());
    next.delete("auth");
    router.replace(makeHref(next), { scroll: false });
  };

  const auth = sp.get("auth");

  if (auth === "login") {
    return <LoginModal onClose={close} onOpenSignup={() => open("signup")} />;
  }
  if (auth === "signup") {
    return <SignUpModal onClose={close} onOpenLogin={() => open("login")} />;
  }
  return null;
}
