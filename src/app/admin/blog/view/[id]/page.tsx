"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Tag,
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Eye,
  FileText,
  Layers,
} from "lucide-react";
import Button from "@/components/admin/Button";
import ConfirmModal from "@/components/admin/ConfirmModal";
import toast from "react-hot-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  status: string;
  is_featured: boolean;
  author_name: string;
  author_avatar: string;
  author_bio: string;
  published_at: string;
  read_time: number;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  related_services?: string[];
  related_packages?: string[];
}

interface Service {
  id: string;
  name: string;
}

interface Package {
  id: string;
  name: string;
}

const sampleServices: Service[] = [
  { id: "1", name: "Wedding Photography" },
  { id: "2", name: "Catering Services" },
  { id: "3", name: "DJ & Music" },
  { id: "4", name: "Decoration" },
  { id: "5", name: "Venue" },
  { id: "6", name: "Makeup & Beauty" },
];

const samplePackages: Package[] = [
  { id: "1", name: "Basic Wedding Package" },
  { id: "2", name: "Premium Wedding Package" },
  { id: "3", name: "Luxury Wedding Package" },
  { id: "4", name: "Engagement Package" },
];

const samplePosts: BlogPost[] = [
  {
    id: "1",
    title: "10 Tips for Planning the Perfect Wedding",
    slug: "10-tips-for-planning-the-perfect-wedding",
    excerpt:
      "Discover essential tips to make your wedding day unforgettable. From budgeting to guest lists, we've got you covered with expert advice that will ensure your special day runs smoothly.",
    content: `## Start Early
Planning a wedding takes time. Start at least 12-18 months in advance to secure your dream venue and vendors.

## Set a Realistic Budget
Determine your total budget and allocate funds to different categories. Don't forget to set aside 10-15% for unexpected expenses.

## Create a Guest List
Decide on your guest count early as it affects almost every other decision - from venue size to catering costs.

## Book Key Vendors First
Venue, photographer, and caterer should be your top priorities. These book up quickly, especially during peak wedding season.

## Personalize Your Ceremony
Add personal touches that reflect your relationship. Write your own vows or include cultural traditions that matter to you.

## Plan for Contingencies
Always have a backup plan for outdoor weddings. Weather can be unpredictable!

## Delegate Tasks
Don't try to do everything yourself. Assign tasks to trusted friends, family, or hire a wedding coordinator.

## Take Care of Yourselves
Amidst all the planning, don't forget to rest and spend quality time together. A stressed couple doesn't make for a happy wedding day.

## Communicate Clearly
Keep your vendors and wedding party informed about timelines and expectations.

## Enjoy the Journey
Remember what this is all about - celebrating your love. Don't get lost in the small stuff!`,
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    category: "Tips & Advice",
    tags: ["Wedding", "Planning", "Tips"],
    status: "published",
    is_featured: true,
    author_name: "Sarah Johnson",
    author_avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    author_bio: "Wedding planner with 10+ years of experience. Helping couples create their dream weddings since 2014.",
    published_at: "2024-03-15T10:00:00",
    read_time: 5,
    created_at: "2024-03-10T08:00:00",
    updated_at: "2024-03-15T09:00:00",
    meta_title: "10 Wedding Planning Tips | Expert Advice",
    meta_description: "Expert wedding planning tips to make your special day perfect. From budgeting to venue selection, get professional advice.",
    og_image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    related_services: ["1", "2", "4"],
    related_packages: ["1", "2"],
  },
  {
    id: "2",
    title: "Top Wedding Venues in 2024",
    slug: "top-wedding-venues-in-2024",
    excerpt: "Explore the most stunning wedding venues for your special day...",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    cover_image: "https://images.unsplash.com/photo-1464366400600-7168b6af0bc1",
    category: "Venues",
    tags: ["Venues", "Destination Wedding", "Luxury"],
    status: "published",
    is_featured: true,
    author_name: "Michael Chen",
    author_avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    author_bio: "Luxury wedding venue specialist",
    published_at: "2024-03-20T14:30:00",
    read_time: 7,
    created_at: "2024-03-18T10:00:00",
    updated_at: "2024-03-20T12:00:00",
    related_services: ["5"],
    related_packages: ["1", "2"],
  },
];

// Simple markdown renderer for preview
const MarkdownContent = ({ content }: { content: string }) => {
  const renderContent = () => {
    let html = content;
    // Headings
    html = html.replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-800">$1</h2>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    // Lists
    html = html.replace(/\n- (.*?)(\n|$)/g, '<li class="ml-4 mb-1">• $1</li>');
    html = html.replace(/<li/g, '\n<ul class="my-3 space-y-1"><li');
    html = html.replace(/(<\/li>\n)+/g, '</li></ul>\n');
    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');
    html = `<p class="mb-4 text-gray-700 leading-relaxed">${html}</p>`;
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return <div className="prose max-w-none">{renderContent()}</div>;
};

export default function ViewBlogPost() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const found = samplePosts.find((p) => p.id === params.id);
    if (found) {
      setPost(found);
    } else {
      toast.error("Post not found");
      router.push("/admin/blog");
    }
    setLoading(false);
  }, [params.id, router]);

  const handleEdit = () => {
    router.push(`/admin/blog/edit/${post?.id}`);
  };

  const handleDelete = () => {
    toast.success("Post deleted successfully!");
    setIsDeleteModalOpen(false);
    router.push("/admin/blog");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-500 mt-3">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Post not found</p>
          <Button onClick={() => router.push("/admin/blog")} className="mt-4 bg-orange-500 hover:bg-orange-600">
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  // Get related services and packages names
  const relatedServicesList = sampleServices.filter(s => post.related_services?.includes(s.id));
  const relatedPackagesList = samplePackages.filter(p => post.related_packages?.includes(p.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Preview Post</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              View blog post details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleEdit} className="!border-gray-300">
            <Edit size={15} className="mr-1" />
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(true)}
            className="!border-red-300 !text-red-600 hover:!bg-red-50"
          >
            <Trash2 size={15} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover Image */}
        {post.cover_image && (
          <div className="relative h-96 w-full bg-gray-100">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {post.is_featured && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 shadow-md">
                <Star size={14} fill="currentColor" />
                Featured
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
              <div className="flex items-center gap-4 text-white/90 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not published"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {post.read_time} min read
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Meta Info Bar */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              {post.category}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                post.status
              )}`}
            >
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </span>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl mb-8">
              <p className="text-gray-700 italic">{post.excerpt}</p>
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-200">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-orange-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                <User size={24} className="text-orange-500" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-1">
                <User size={14} className="text-gray-400" />
                {post.author_name || "Anonymous"}
              </p>
              {post.author_bio && (
                <p className="text-sm text-gray-500 mt-0.5">{post.author_bio}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            <MarkdownContent content={post.content} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Services & Packages */}
          {(relatedServicesList.length > 0 || relatedPackagesList.length > 0) && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Layers size={18} /> Related
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {relatedServicesList.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {relatedServicesList.map(service => (
                        <span key={service.id} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200">
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {relatedPackagesList.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Packages</h4>
                    <div className="flex flex-wrap gap-2">
                      {relatedPackagesList.map(pkg => (
                        <span key={pkg.id} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs border border-green-200">
                          {pkg.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEO Meta Info (if available) */}
          {(post.meta_title || post.meta_description) && (
            <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 -mx-8 px-8 py-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Eye size={14} /> SEO Preview
              </h4>
              {post.meta_title && (
                <p className="text-blue-600 text-base font-medium">{post.meta_title}</p>
              )}
              {post.meta_description && (
                <p className="text-gray-500 text-sm mt-1">{post.meta_description}</p>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
            <p>Created: {new Date(post.created_at).toLocaleString()}</p>
            <p>Last updated: {new Date(post.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}