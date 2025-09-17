import { Badge } from './ui/badge';

const SkillTag = ({ skill, variant = 'default', className = '' }) => {
  const variants = {
    default: 'skill-tag',
    offered: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
    wanted: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20',
    pending: 'status-pending',
    accepted: 'status-accepted',
    rejected: 'status-rejected'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${variants[variant]} ${className} transition-smooth`}
    >
      {skill}
    </Badge>
  );
};

export default SkillTag;