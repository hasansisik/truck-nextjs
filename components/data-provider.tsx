"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hook";
import { getMyProfile } from "@/redux/actions/userActions";
import { getAllVehicles } from "@/redux/actions/vehicleActions";
import { getAllDrivers } from "@/redux/actions/driverActions";
import { getAllCompanies } from "@/redux/actions/companyActions";
import { usePathname } from "next/navigation";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (!isLoginPage) {
      dispatch(getMyProfile());
      dispatch(getAllVehicles());
      dispatch(getAllDrivers());
      dispatch(getAllCompanies());
    }
  }, [dispatch, isLoginPage]);

  return <>{children}</>;
} 