import { Typography } from '@mui/material';

interface MultilineEllipsisProps {
  text: string;
  lineClamp?: number;
  variant?: any;
}

export const MultilineEllipsis = ({ 
  text, 
  lineClamp = 3, 
  variant = 'body1' 
}: MultilineEllipsisProps) => {
  return (
    <Typography
      variant={variant}
      className="multiline-ellipsis"
      sx={{
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: lineClamp,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'normal',
      }}
    >
      {text}
    </Typography>
  );
};