
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface GenrePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function GenrePagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: GenrePaginationProps) {
  return (
    <div className="flex justify-between items-center mt-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"} 
            />
          </PaginationItem>
          
          {/* Display page numbers */}
          {[...Array(Math.min(5, totalPages))].map((_, idx) => {
            // For simplicity, show up to 5 pages
            let pageNum = idx + 1;
            if (totalPages > 5) {
              if (currentPage <= 3) {
                // At the beginning
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                // At the end
                pageNum = totalPages - 4 + idx;
              } else {
                // In the middle
                pageNum = currentPage - 2 + idx;
              }
            }
            
            return (
              <PaginationItem key={idx}>
                <PaginationLink 
                  isActive={pageNum === currentPage}
                  onClick={() => onPageChange(pageNum)}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"} 
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
}
