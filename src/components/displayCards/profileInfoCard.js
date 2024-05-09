import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Box, Typography, Card, Divider, Tooltip, Avatar } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

const cardStyle = {
  borderRadius: 15,
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

const avatarStyle = {
  width: '120px',
  height: '120px',
  marginBottom: '10px',
};

const badgeStyle = {
  position: 'absolute',
  top: '3vh',
  right: '11vh',
};

function ProfileInfoCard({ title, info, action, avatar}) {
  const labels = [];
  const values = [];

  Object.keys(info).forEach((el) => {
    if (el.match(/[A-Z\s]+/)) {
      const uppercaseLetter = Array.from(el).find((i) => i.match(/[A-Z]+/));
      const newElement = el.replace(uppercaseLetter, ` ${uppercaseLetter.toLowerCase()}`);

      labels.push(newElement);
    } else {
      labels.push(el);
    }
  });

  Object.values(info).forEach((el) => values.push(el));

  const renderItems = labels.map((label, key) => (
    <Box key={label} display="flex" py={1} pr={2}>
      <Typography variant="button" fontWeight="bold" textTransform="capitalize">
        {label}: &nbsp;
      </Typography>
      <Typography variant="button" fontWeight="regular" color="text">
        &nbsp;{values[key]}
      </Typography>
    </Box>
  ));



  return (
    <Card sx={cardStyle}>
      <Box sx={contentStyle} display="flex" justifyContent="space-between" alignItems="center" pt={2} px={2}>
        <Typography variant="h4" fontWeight={700} textTransform="capitalize"  color='#e5e5e5' marginBottom={2}>
          {title}
        </Typography>
          <Avatar
            style={avatarStyle}
            src={avatar}
            alt="User Avatar"
          />
        <Typography component={Link} to={action.route} variant="body2" color="secondary">
          <Tooltip title={action.tooltip} placement="top" style={badgeStyle}>
            <EditIcon/>
          </Tooltip>
        </Typography>
      </Box>
      <Box p={2}>
        <Box mb={2} lineHeight={1}>
        </Box>
        <Box opacity={0.3}>
          <Divider />
        </Box>
        <Box sx={contentStyle} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={400} textTransform="capitalize"  color='#e5e5e5'> 
          {renderItems}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

// Setting default props for the ProfileInfoCard
ProfileInfoCard.defaultProps = {
  shadow: true,
};

// Typechecking props for the ProfileInfoCard
ProfileInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  info: PropTypes.objectOf(PropTypes.string).isRequired,
  action: PropTypes.shape({
    route: PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired,
  }).isRequired,
  shadow: PropTypes.bool,
};

export default ProfileInfoCard;