import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";

interface Props {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageRangeDisplayed?: number;
  marginPagesDisplayed?: number;
}

export const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  pageRangeDisplayed = 5,
  marginPagesDisplayed = 1,
}: Props) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationItems = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 1) return pages;
    const startPage = 1;
    const endPage = totalPages;
    const range = pageRangeDisplayed;

    if (startPage <= endPage) {
      for (let i = startPage; i <= Math.min(startPage + marginPagesDisplayed - 1, endPage); i++) {
        pages.push(i);
      }
    }

    let leftSide = Math.max(startPage + marginPagesDisplayed, currentPage - Math.floor(range / 2));
    let rightSide = Math.min(endPage - marginPagesDisplayed, currentPage + Math.ceil(range / 2) - 1);

    if (rightSide - leftSide + 1 < range) {
      rightSide = Math.min(endPage - marginPagesDisplayed, leftSide + range - 1);
      leftSide = Math.max(startPage + marginPagesDisplayed, rightSide - range + 1);
    }

    if (leftSide > startPage + marginPagesDisplayed) {
      pages.push('...');
    }

    for (let i = leftSide; i <= rightSide; i++) {
      if (i > startPage + marginPagesDisplayed - 1 && i < endPage - marginPagesDisplayed + 1) {
        pages.push(i);
      }
    }

    if (rightSide < endPage - marginPagesDisplayed) {
      pages.push('...');
    }

    for (let i = Math.max(startPage, endPage - marginPagesDisplayed + 1); i <= endPage; i++) {
      if (i < endPage - marginPagesDisplayed + 1 || pages.indexOf(i) === -1) {
        pages.push(i);
      }
    }

    return pages.filter((item, index, self) => {
      if (typeof item === 'number') {
        return self.findIndex(i => i === item) === index;
      }
      return true;
    });

  }, [totalPages, currentPage, pageRangeDisplayed, marginPagesDisplayed]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 1;
  const endItem = totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 30;
  const infoText = `Hiển thị từ ${ startItem } đến ${ endItem } trong tổng số ${ totalItems } bản ghi`;

  const baseButtonClasses = "min-w-[35px] h-9 px-3 py-1 border rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center justify-center";

  const getPageButtonClasses = (page: number) => {
    const isActive = page === currentPage;
    return `${ baseButtonClasses } ${
      isActive
        ? 'bg-blue-100 border-blue-500 text-blue-700 font-bold hover:bg-blue-100 focus:outline-none focus:outline-none'
        : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-400'
    }`;
  };

  const getIconButtonClasses = (isDisabled: boolean) => {
    return `${ baseButtonClasses } bg-orange-500 text-white border-orange-500 font-bold ${
      isDisabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:bg-orange-600'
    }`;
  };

  if (totalPages === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-start py-4 font-sans text-sm">

      {
        totalItems > 0 && (
          <span className="mr-5 text-gray-700">
            { infoText }
          </span>
        )
      }

      <div className="flex space-x-1">
        <Button
          className={ getIconButtonClasses(currentPage === 1) }
          onClick={ () => goToPage(1) }
          disabled={ currentPage === 1 }
        >
          &laquo;
        </Button>

        { paginationItems.map((item, index) => {
          if (item === '...') {
            return (
              <span
                key={ `item_${index}` }
                className="min-w-[35px] h-9 px-3 py-1 text-gray-500 flex items-center justify-center text-lg"
              >
                ...
              </span>
            );
          }
          const page = item as number;
          return (
            <Button
              key={ page }
              className={ getPageButtonClasses(page) }
              onClick={ () => goToPage(page) }
            >
              { page }
            </Button>
          );
        }) }

        <Button
          className={ getIconButtonClasses(currentPage === totalPages) }
          onClick={ () => goToPage(totalPages) }
          disabled={ currentPage === totalPages }
        >
          &raquo;
        </Button>
      </div>
    </div>
  );
};
