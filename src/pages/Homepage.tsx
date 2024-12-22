import React from "react";
import { Box, Typography, Button, Grid, Card, CardContent, CircularProgress } from "@mui/material";
import { DateRange, Feedback } from "@mui/icons-material";
import { motion } from "framer-motion";

const Home = () => {
  // Example static data
  const nextParadeDate = "Saturday, January 6, 2024";
  const eventImages = [
    "tenz.jpg",
    "tenz.jpg",
    "tenz.jpg", // Replace with actual image paths
  ];
  const officersAndNCOs = [
    { name: "John Doe", rank: "Captain", profileImage: "john.jpg" },
    { name: "Jane Smith", rank: "Sergeant", profileImage: "jane.jpg" },
    // Add more officers and NCOs
  ];

  return (
    <Box>
      {/* Top Section: Next Parade & Slides */}
      <Box sx={{ textAlign: "center", py: 4, backgroundColor: "#f5f5f5" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          Next Parade
        </Typography>
        <Typography variant="h6" sx={{ color: "#555" }}>
          {nextParadeDate}
        </Typography>
        {/* Slideshow */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            overflow: "auto",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {eventImages.map((img, index) => (
            <motion.img
              key={index}
              src='/images/tenz.jpg'
              alt={`Event ${index + 1}`}
              style={{ width: "300px", height: "200px", borderRadius: "8px" }}
              whileHover={{ scale: 1.05 }}
            />
          ))}
        </Box>
      </Box>

      {/* Calendar & Battalion Order Section */}
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Calendar & Battalion Order
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mx: 2 }}
          href="/path/to/calendar.pdf"
          download
        >
          Download Calendar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mx: 2 }}
          href="/path/to/battalion-order.pdf"
          download
        >
          Download Battalion Order
        </Button>
      </Box>

      {/* Forms Section */}
      <Box sx={{ textAlign: "center", py: 4, backgroundColor: "#eef2f3" }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Forms
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {[
            { name: "Pre-Junior Form", link: "/forms/pre-junior.pdf" },
            { name: "Junior Form", link: "/forms/junior.pdf" },
            { name: "Senior Form", link: "/forms/senior.pdf" },
            { name: "Senior/Junior Form", link: "/forms/senior-junior.pdf" },
            { name: "Leave Application", link: "/forms/leave.pdf" },
            { name: "Subscription Fees (Senior)", link: "/forms/subscription-senior.pdf" },
            { name: "Subscription Fees (Junior)", link: "/forms/subscription-junior.pdf" },
            { name: "Founder's Badge", link: "/forms/founders-badge.pdf" },
            { name: "President's Badge", link: "/forms/presidents-badge.pdf" },
          ].map((form, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{form.name}</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href={form.link}
                    download
                    sx={{ mt: 2 }}
                  >
                    Download
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Officers & NCOs Section */}
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Our Officers & NCOs
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {officersAndNCOs.map((officer, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <img
                    src='/images/caleb-loo.jpg'
                    alt={officer.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      marginBottom: "10px",
                    }}
                  />
                  <Typography variant="h6">{officer.name}</Typography>
                  <Typography variant="body1">{officer.rank}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Feedback Button */}
      <Box
        sx={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 10,
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Feedback />}
          onClick={() => alert("Feedback form coming soon!")}
        >
          Feedback
        </Button>
      </Box>
    </Box>
  );
};

export default Home;
