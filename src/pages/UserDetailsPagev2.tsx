import React, { useEffect, useState } from "react";
import { getDataFromFirebase } from "../firebase/firebaseUtils";
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
} from "@mui/material";

type RankType = "Sergeant" | "Corporal" | "Lance Corporal" | "Private" | "Recruit";

const rankAbbreviations: Record<RankType, string> = {
  Recruit: "RCT",
  Private: "PVT",
  "Lance Corporal": "LCPL",
  Corporal: "CPL",
  Sergeant: "SGT",
};

const getRankColor = (rank: RankType) => {
  const colors: Record<RankType, string> = {
    Sergeant: '#8b0000',
    Corporal: '#00008b',
    'Lance Corporal': '#006400',
    Private: '#4a4a4a',
    Recruit: '#2f4f4f',
  };
  return colors[rank];
};

export const UserDetailsPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const rankOrder: RankType[] = ["Sergeant", "Corporal", "Lance Corporal", "Private", "Recruit"];

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
      <Box
        sx={{
          width: '100%',
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={60}
            thickness={5}
            sx={{
              color: '#8b0000',
              mb: 2,
            }}
          />
          <Typography
            sx={{
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Accessing Personnel Records
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTop: '4px solid #8b0000',
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: '#8b0000',
              '&:hover': {
                bgcolor: '#660000',
              },
            }}
            onClick={() => window.location.reload()}
          >
            Retry Access
          </Button>
        </Paper>
      </Box>
    );
  }

  // Group users by rank
  const groupedUsers = (Object.keys(rankAbbreviations) as RankType[]).map((rank) => ({
    rank,
    users: users.filter((user) => user.rank === rank),
  })).sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #1a1a1a, #2d2d2d)',
        color: '#fff',
      }}
    >
      <Box
        sx={{
          width: 1200,
          margin: '0 auto',
          pt: 6,
          pb: 8,
        }}
      >
        <Box sx={{
          mb: 6,
          borderBottom: '2px solid rgba(255,255,255,0.1)',
          pb: 3,
        }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Command Structure
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {groupedUsers.map(({ rank }) => (
            <Box
              key={rank}
              sx={{
                background: 'linear-gradient(to right, rgba(255,255,255,0.05), transparent)',
                borderLeft: `4px solid ${getRankColor(rank)}`,
                p: 4,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  color: getRankColor(rank),
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <span style={{
                  backgroundColor: getRankColor(rank),
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8em'
                }}>
                  {rankAbbreviations[rank]}
                </span>
                {rank}
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
            <UserDialog
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          )}
              
            </Box>
          ))}
        </Box>
      </Box>

      {selectedUser && (
        <UserDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </Box>
  );
};

export default UserDetailsPage;
