import React, { useEffect, useState } from "react";
import { getDataFromFirebase } from "../firebase/firebaseUtils";
import UserCard from "../components/Members'details/UserCard";
import UserDialog from "../components/Members'details/UserDialog";
import UserGroup from "../components/Members'details/UserGroup";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const rankAbbreviations: Record<string, string> = {
  Recruit: "RCT",
  Private: "PVT",
  "Lance Corporal": "LCPL",
  Corporal: "CPL",
  Sergeant: "SGT",
};




export const UserDetailsPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const rankOrder = ["Sergeant", "Corporal", "Lance Corporal", "Private", "Recruit"];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const result = await getDataFromFirebase("users");

        if (result.success) {
          const transformedUsers = Object.values(result.data || {});
          setUsers(transformedUsers);
        } else {
          setError(result.message || "Failed to fetch user data.");
        }
      } catch (err) {
        setError("An error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  // Group users by rank
  const groupedUsers = Object.keys(rankAbbreviations)
    .map((rank) => ({
      rank,
      users: users.filter((user) => user.rank === rank),
    }))
    .sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Details
      </Typography>

      {groupedUsers.map(({ rank, users }) => (
        <UserGroup
          key={rank}
          rank={rank}
          users={users}
          onSelect={(user) => setSelectedUser(user)}
        />
      ))}

      {selectedUser && (
        <UserDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </Container>
  );
};

export default UserDetailsPage;

