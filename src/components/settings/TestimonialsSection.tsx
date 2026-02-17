import { useState } from "react";
import { Plus, Trash2, Edit2, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSettings, Testimonial } from "@/hooks/useSettings";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function TestimonialsSection() {
    const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useSettings();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

    const [formData, setFormData] = useState({
        author_name: "",
        author_role: "",
        content: "",
        rating: 5,
        image_url: "",
        is_active: true,
    });

    const handleOpenDialog = (testimonial?: Testimonial) => {
        if (testimonial) {
            setEditingTestimonial(testimonial);
            setFormData({
                author_name: testimonial.author_name,
                author_role: testimonial.author_role || "",
                content: testimonial.content,
                rating: testimonial.rating,
                image_url: testimonial.image_url || "",
                is_active: testimonial.is_active,
            });
        } else {
            setEditingTestimonial(null);
            setFormData({
                author_name: "",
                author_role: "",
                content: "",
                rating: 5,
                image_url: "",
                is_active: true,
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.author_name || !formData.content) return;

        if (editingTestimonial?.id) {
            await updateTestimonial(editingTestimonial.id, formData);
        } else {
            await addTestimonial(formData);
        }
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Testimonials</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage feedback from your patients to display on the marketing page.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Testimonial
                </Button>
            </div>

            {testimonials.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <Quote className="h-10 w-10 mb-2 opacity-20" />
                        <p>No testimonials yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {testimonials.map((t) => (
                        <Card key={t.id} className={!t.is_active ? "opacity-60" : ""}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border">
                                        {t.image_url ? (
                                            <img src={t.image_url} alt={t.author_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold">{t.author_name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-bold">{t.author_name}</CardTitle>
                                        <CardDescription className="text-xs">{t.author_role}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(t)}>
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTestimonial(t.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-3 w-3 ${i < t.rating ? "fill-primary text-primary" : "text-muted"}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm italic text-muted-foreground line-clamp-3">"{t.content}"</p>
                                {!t.is_active && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded mt-2 inline-block">Hidden</span>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
                        <DialogDescription>
                            Create or modify a patient testimonial.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="author_name" className="text-right">Name</Label>
                            <Input
                                id="author_name"
                                value={formData.author_name}
                                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="author_role" className="text-right">Role/Title</Label>
                            <Input
                                id="author_role"
                                placeholder="e.g. Regular Patient"
                                value={formData.author_role}
                                onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="rating" className="text-right">Rating</Label>
                            <div className="flex items-center gap-1 col-span-3">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Button
                                        key={s}
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto"
                                        onClick={() => setFormData({ ...formData, rating: s })}
                                    >
                                        <Star className={`h-5 w-5 ${s <= formData.rating ? "fill-primary text-primary" : "text-muted"}`} />
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="content" className="text-right mt-2">Content</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="col-span-3"
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image_url" className="text-right">Image URL</Label>
                            <Input
                                id="image_url"
                                placeholder="https://..."
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="is_active" className="text-right">Active</Label>
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
