import { Typography, Box } from '@mui/material';

const EligibilitySummary: React.FC<{ isPresidentBadge: boolean }> = ({ isPresidentBadge }) => {
  return (
    <Box sx={{ padding: 2 }}>
      {isPresidentBadge ? (
        <>
          <Typography variant="h6" color="success.main" fontWeight="bold">
            Time to go for Founders?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
            Please meet Inst Elijah for more info...
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="body2" color="success.main" sx={{ marginTop: 2, fontWeight: 'bold' }}>
            Congratulations! You meet all the requirements for the President's Badge.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
            Please meet Inst Elijah for your application process.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default EligibilitySummary;
