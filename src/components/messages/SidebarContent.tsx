
import { Friend } from "@/hooks/use-friends";
import { MessagesHeader } from "./MessagesHeader";
import { YourNote } from "./YourNote";
import { NavigationTabs } from "./NavigationTabs";
import { SearchBar } from "./SearchBar";
import { GroupChatButton } from "./GroupChatButton";
import { FriendList } from "./FriendList";
import { ArchivedChats } from "./ArchivedChats";
import { useState } from "react";

interface SidebarContentProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onGroupChatClick: () => void;
  filteredFriends: Friend[];
  selectedFriend: Friend | null;
  onSelectFriend: (friend: Friend) => void;
  onLongPress: (friendId: string) => void;
  onPressEnd: () => void;
  archivedFriends: Friend[];
  onUnarchive: (friendId: string) => void;
}

export const SidebarContent = ({
  searchQuery,
  onSearchChange,
  onGroupChatClick,
  filteredFriends,
  selectedFriend,
  onSelectFriend,
  onLongPress,
  onPressEnd,
  archivedFriends,
  onUnarchive,
}: SidebarContentProps) => {
  const [activeTab, setActiveTab] = useState<"inbox" | "communities">("inbox");

  return (
    <div className="flex flex-col h-full">
      <MessagesHeader />
      <YourNote />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === "inbox" && (
        <>
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
          <div className="flex-1 overflow-y-auto">
            <GroupChatButton onClick={onGroupChatClick} />
            <FriendList 
              friends={filteredFriends}
              selectedFriend={selectedFriend}
              onSelectFriend={onSelectFriend}
              onLongPress={onLongPress}
              onPressEnd={onPressEnd}
            />
            <ArchivedChats 
              archivedFriends={archivedFriends}
              onUnarchive={onUnarchive}
            />
          </div>
        </>
      )}
      
      {activeTab === "communities" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-muted-foreground text-sm">
              Las comunidades estarán disponibles pronto
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
