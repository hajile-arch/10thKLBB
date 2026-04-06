import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Divider,
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
  const safeBadges: SelectedBadge[] = (badges || []).map((b, index) => ({
  badgeKey: b.badgeKey || `${b.name}-${index}`, // ensure unique key
  name: b.name || "Unnamed Badge",
  level: b.level === "Basic" || b.level === "Advanced" ? b.level : undefined,
  category: b.category,
  subCategory: b.subCategory,
  awardedDate: b.awardedDate,
}));

console.log("UserDialog received badges:", badges);


  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        <Box>
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.rank} • {user.status}
          </Typography>
        </Box>

        <IconButton onClick={onClose} sx={{ marginLeft: "auto" }} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent dividers>
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Badges
          </Typography>
          <BadgesList badges={safeBadges} />
        </Box>
        <Box mb={2}>
  <Typography variant="body2">Debug: {safeBadges.length} badges loaded</Typography>
</Box>

        <Divider sx={{ my: 3 }} />

        <EligibilityChecker member={user} memberBadges={safeBadges} />
      </DialogContent>
    </Dialog>
  );
};


export default UserDialog;
