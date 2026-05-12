
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function withAuth(Component: any, allowedRoles: string[]) {
  return function ProtectedRoute(props: any) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      if (!allowedRoles.includes(user.role)) {
        router.push("/dashboard"); // Redirect to dashboard if not authorized
        return;
      }

      setIsAuthorized(true);
    }, [router, pathname]);

    if (!isAuthorized) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#0a0a0a',
          color: 'white'
        }}>
          Loading...
        </div>
      );
    }

    return <Component {...props} />;
  };
}
