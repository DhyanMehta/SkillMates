import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

const RatingDialog = ({ triggerLabel = 'Rate', triggerVariant = 'default', onSubmit, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(null);
  const [feedback, setFeedback] = useState('');

  const submit = () => {
    if (!rating) return;
    onSubmit?.(rating, feedback?.trim() || undefined);
    setOpen(false);
    setRating(5);
    setFeedback('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={triggerVariant} disabled={disabled}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a rating</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Your rating</Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star className={`w-6 h-6 ${(hover ?? rating) >= star ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="feedback" className="mb-2 block">Feedback (optional)</Label>
            <Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well? What could improve?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="gradient-primary text-primary-foreground" onClick={submit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;


