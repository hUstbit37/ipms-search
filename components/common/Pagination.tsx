"use client";

import React from "react";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

type Props = {
	page: number;
	totalPages: number;
	total: number;
	onPageChange: (page: number) => void;
	pageSize: number;
	onPageSizeChange: (size: number) => void;
};

const generatePages = (page: number, totalPages: number) => {
	const pages: (number | "...")[] = [];

	if (totalPages <= 10) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	pages.push(1);

	if (page > 4) pages.push("...");

	const start = Math.max(2, page - 1);
	const end = Math.min(totalPages - 1, page + 1);

	for (let i = start; i <= end; i++) pages.push(i);

	if (page < totalPages - 3) pages.push("...");

	pages.push(totalPages);

	return pages;
};

const PaginationComponent: React.FC<Props> = ({
	page,
	totalPages,
	total,
	onPageChange,
	pageSize,
	onPageSizeChange,
}) => {
	const pages = generatePages(page, totalPages);

	return (
		<div className="flex justify-end w-full mt-3">
			<div className="flex items-center gap-4">
				{/* TOTAL */}
				<div className="text-sm text-gray-500 shrink-0">
					Tổng số: {total} bản ghi
				</div>

				{/* PAGINATION */}
				<Pagination>
					<PaginationContent>

						{/* Prev */}
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (page > 1) onPageChange(page - 1);
								}}
								className={page === 1 ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>

						{/* Page numbers */}
						{pages.map((p, idx) =>
							p === "..." ? (
								<PaginationItem key={`ellipsis-${idx}`}>
									<PaginationEllipsis />
								</PaginationItem>
							) : (
								<PaginationItem key={p}>
									<PaginationLink
										href="#"
										onClick={(e) => {
											e.preventDefault();
											onPageChange(p);
										}}
										isActive={p === page}
									>
										{p}
									</PaginationLink>
								</PaginationItem>
							)
						)}

						{/* Next */}
						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (page < totalPages) onPageChange(page + 1);
								}}
								className={page === totalPages ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>

				{/* PAGE SIZE SELECT */}
				<Select
					value={String(pageSize)}
					onValueChange={(v) => onPageSizeChange(Number(v))}
				>
					<SelectTrigger className="w-[120px]">
						<SelectValue placeholder="Số dòng" />
					</SelectTrigger>
					<SelectContent>
						{PAGE_SIZE_OPTIONS.map((size) => (
							<SelectItem key={size} value={String(size)}>
								{size} / trang
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};

export default PaginationComponent;
