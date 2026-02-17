import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/hooks/useSettings";

export function GallerySection() {
    const { clinicSettings, updateClinicSettings } = useSettings();
    const [newImageUrl, setNewImageUrl] = useState("");

    const galleryImages = clinicSettings?.gallery_images || [];

    const handleAddImage = async () => {
        if (!newImageUrl.trim()) return;

        const updatedImages = [...galleryImages, newImageUrl.trim()];
        await updateClinicSettings({ gallery_images: updatedImages });
        setNewImageUrl("");
    };

    const handleDeleteImage = async (url: string) => {
        const updatedImages = galleryImages.filter((img) => img !== url);
        await updateClinicSettings({ gallery_images: updatedImages });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Clinic Gallery</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage the images displayed on your marketing page.
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Enter image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="max-w-md"
                />
                <Button onClick={handleAddImage} disabled={!newImageUrl.trim()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Image
                </Button>
            </div>

            {galleryImages.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                        <p>No images in your gallery yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryImages.map((url, index) => (
                        <div key={index} className="group relative aspect-video rounded-md overflow-hidden bg-muted border">
                            <img
                                src={url}
                                alt={`Gallery image ${index + 1}`}
                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteImage(url)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
