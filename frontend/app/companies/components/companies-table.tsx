"use client";

import { useState, useEffect } from "react";
import { fetchAllCompaniesWithScore } from "../actions/fetch-companies";
import { CompanyFull } from "@/types";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CaretSortIcon } from "@radix-ui/react-icons";

export function CompaniesTable() {
  const [companies, setCompanies] = useState<CompanyFull[]>([]);
  const [sortOrder, setSortOrder] = useState("");

  const toggleSortOrder = () => {
    let newSortOrder = "";
    if (sortOrder === "" || sortOrder === "desc") {
      newSortOrder = "asc";
    }
    else {
      newSortOrder = "desc";
    }
    setSortOrder(newSortOrder);
    setCompanies(
      [...companies].sort((a, b) => {
        if (a.score === undefined) return 1;
        if (b.score === undefined) return -1;
        return newSortOrder === 'asc' ? a.score - b.score : b.score - a.score;
      })
    );
  };

  useEffect(() => {
    const getAllCompanies = async () => {
      const response = await fetchAllCompaniesWithScore();
      console.log(response);
      setCompanies(response);
    };
    getAllCompanies();
  }, []);

  if (companies.length === 0) {
    return <></>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Exchange</TableHead>
          <TableHead>Curreny</TableHead>
          <TableHead onClick={toggleSortOrder} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <p>Score</p>
              <CaretSortIcon />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex gap-4 items-center">
                <div className="rounded-full overflow-hidden w-6 h-6">
                  <img
                    src={`/icons/small/${company.ticker}.svg`}
                    alt={`${company.ticker} icon`}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="flex w-20 justify-center">
                  <Link href={`/companies/${company.ticker}`}>
                    <Badge variant="secondary" className="hover:bg-gray-300 transition-colors duration-300 ease-in-out">{company.ticker}</Badge>
                  </Link>
                </div>
                <Link href={`/companies/${company.ticker}`}>
                  <p className="font-semibold">{company.company_name}</p>
                </Link>
              </div>
            </TableCell>
            <TableCell>{company.exchange}</TableCell>
            <TableCell>{company.currency}</TableCell>
            <TableCell>{company.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
