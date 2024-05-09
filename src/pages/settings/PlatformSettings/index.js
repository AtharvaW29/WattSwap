import { useState } from "react";

import { Box, Typography, Switch, Card, Divider } from "@mui/material";

function PlatformSettings() {
  const [followsMe, setFollowsMe] = useState(false);
  const [answersPost, setAnswersPost] = useState(false);
  const [mentionsMe, setMentionsMe] = useState(false);
  const [newLaunches, setNewLaunches] = useState(false);
  const [productUpdate, setProductUpdate] = useState(false);
  const [newsletter, setNewsletter] = useState(false);


  const cardStyle = {
    borderRadius: 20,
    background: 'linear-gradient(to right, #7B68EE, #7209b7)', // Purple to Orange-400 gradient
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.2)',
    backdropFilter: 'blur(5px)',
    transition: 'background 0.5s ease-in-out',
    '&:hover': {
      background: 'linear-gradient(to right, #7209b7, #7B68EE)', // Orange-400 to Purple on hover
    },
  };
  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#fff',
    position: 'relative',
  };

  return (
    <Card sx={cardStyle}>
      <Box p={2} sx={contentStyle}>
        <Typography variant="h4" fontWeight={700} textTransform="capitalize" color='#e5e5e5'>
          platform settings
        </Typography>
      </Box>
      <Box opacity={0.3} justifyContent="space-between" alignItems="center">
          <Divider />
        </Box>

      <Box pt={1} pb={2} px={2} lineHeight={1.25} sx={contentStyle}>

        {/*Account Settings */}
        <Typography variant="caption" fontWeight="bold" color='#e5e5e5'textTransform="uppercase">
          account
        </Typography>
        <ul>
        <li><Box display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <Box mt={0.5}>
            <Switch checked={followsMe} onChange={() => setFollowsMe(!followsMe)} />
          </Box>
          <Box width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color='#e5e5e5'>
              Email me when someone follows me
            </Typography>
          </Box>
        </Box></li>

       <li><Box display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <Box mt={0.5}>
            <Switch checked={answersPost} onChange={() => setAnswersPost(!answersPost)} />
          </Box>
          <Box width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color='#e5e5e5'>
              Email me when someone answers on my post
            </Typography>
          </Box>
        </Box></li>

        <li><Box display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <Box mt={0.5}>
            <Switch checked={mentionsMe} onChange={() => setMentionsMe(!mentionsMe)} />
          </Box>
          <Box width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color='#e5e5e5'>
              Email me when someone mentions me
            </Typography>
          </Box>
        </Box></li>
        </ul>


        <Box mt={3}>
        {/* App Settings */}
        <Box opacity={0.3}>
          <Divider />
        </Box>
          <Typography variant="caption" fontWeight="bold" color='#e5e5e5' textTransform="uppercase">
            application
          </Typography>
        </Box>
        <ul>
        <li><Box display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <Box mt={0.5}>
            <Switch checked={newLaunches} onChange={() => setNewLaunches(!newLaunches)} />
          </Box>
          <Box width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color='#e5e5e5'>
              New launches and projects
            </Typography>
          </Box>
        </Box></li>

        <li><Box display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <Box mt={0.5}>
            <Switch checked={productUpdate} onChange={() => setProductUpdate(!productUpdate)} />
          </Box>
          <Box width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular"color='#e5e5e5'>
              Monthly product updates
            </Typography>
          </Box>
        </Box></li>

        <li><Box display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <Box mt={0.5}>
            <Switch checked={newsletter} onChange={() => setNewsletter(!newsletter)} />
          </Box>
          <Box width="80%" ml={0.5}>
            <Typography variant="button" fontWeight="regular" color="#e5e5e5">
              Subscribe to newsletter
            </Typography>
          </Box>
        </Box></li>
        </ul>
      </Box>
    </Card>
  );
}

export default PlatformSettings;
