import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Divider,
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Member, SelectedBadge } from "../../enum";
import BadgesList from "./BagdesList";
import EligibilityChecker from "../PresidentBadge/EligibilityChecker";

interface UserDialogProps {
  user: Member;
  badges: SelectedBadge[];
  onClose: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ user, badges, onClose }) => {
  const safeBadges = useMemo(() => badges || [], [badges]);
  
  const uniqueBadges = useMemo(() => {
  const map = new Map<string, SelectedBadge>();

  safeBadges.forEach((b) => {
    const existing = map.get(b.badgeKey);

    // Keep Advanced if exists, otherwise Basic
    if (!existing || b.level === "Advanced") {
      map.set(b.badgeKey, b);
    }
  });

  return Array.from(map.values());
}, [safeBadges]);
  const totalBadges = uniqueBadges.length;

  // progress (adjust later if needed)
  const targetBadges = 50;
  const progress = Math.min((totalBadges / targetBadges) * 100, 100);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: "100%",
          maxWidth: 800,
          mx: "auto",

          // responsive tweak for mobile
          px: { xs: 1, sm: 2 },
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.rank} • {user.status}
            </Typography>
          </Box>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      {/* CONTENT */}
      <DialogContent>
        <Box py={2}>
          <Typography variant="body2" gutterBottom>
            Badge Progress: {uniqueBadges.length}/45
          </Typography>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 5 }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* BADGES LIST */}
        <BadgesList badges={safeBadges} />

        <Divider sx={{ my: 2 }} />

        {/* ELIGIBILITY CHECKER */}
        <EligibilityChecker member={user} memberBadges={safeBadges} />
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
