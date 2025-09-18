
import { useState, useEffect } from "react";
import { UserList } from "@/components/popularity/UserList";
import { TopUsers } from "@/components/popularity/TopUsers";
import { Pagination } from "@/components/popularity/Pagination";
import type { PopularUserProfile } from "@/types/database/follow.types";

interface PopularityContentProps {
  users: PopularUserProfile[];
  onProfileClick: (userId: string) => void;
}

export const PopularityContent = ({ users, onProfileClick }: PopularityContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  // Get top 3 users if we have at least 3 users
  const topUsers = users.length >= 3 ? users.slice(0, 3) : [];
  
  // Get the rest of the users starting from the 4th user
  const restOfUsers = users.length > 3 ? users.slice(3) : users;
  
  // Pagination logic
  const totalPages = Math.ceil(restOfUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = restOfUsers.slice(startIndex, startIndex + usersPerPage);
  useEffect(() => {
    const title = "Usuarios populares — corazones combinados";
    document.title = title;
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta("description", "Ranking de usuarios por corazones (perfil + engagement). Descubre a los más populares.");
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/popularity`;
  }, []);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {topUsers.length === 3 && (
        <TopUsers 
          users={topUsers} 
          onProfileClick={onProfileClick} 
        />
      )}
      
      <UserList 
        users={paginatedUsers}
        onProfileClick={onProfileClick}
        startRank={topUsers.length === 3 ? (startIndex + 4) : (startIndex + 1)}
      />
      
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
