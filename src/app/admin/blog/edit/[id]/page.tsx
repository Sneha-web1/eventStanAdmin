'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, Users, Calendar, Layers, ArrowLeft, Image as ImageIcon, X, Plus, Eye, ChevronDown } from 'lucide-react';
import Button from '@/components/admin/Button';
import Input from '@/components/admin/Input';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  author_name: string;
  author_avatar: string;
  author_bio: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  published_at: string;
  read_time: number;
  related_services: string[];
  related_packages: string[];
}

interface Service {
  id: string;
  name: string;
}

interface Package {
  id: string;
  name: string;
}

const categoryOptions = [
  'Trends', 'Venues', 'Decor', 'Wedding Planning', 'Real Weddings',
  'Tips & Advice', 'Fashion', 'Photography', 'Catering', 'Music & Entertainment'
];

const tagOptions = [
  'Wedding', 'Engagement', 'Haldi', 'Mehendi', 'Sangeet', 
  'Reception', 'Destination Wedding', 'Intimate Wedding', 
  'Luxury Wedding', 'Budget Wedding', 'Traditional', 'Modern',
  'Bridal', 'Groom', 'Bridal Party', 'DIY', 'Trending'
];

const sampleServices: Service[] = [
  { id: '1', name: 'Wedding Photography' },
  { id: '2', name: 'Catering Services' },
  { id: '3', name: 'DJ & Music' },
  { id: '4', name: 'Decoration' },
  { id: '5', name: 'Venue' },
  { id: '6', name: 'Makeup & Beauty' },
  { id: '7', name: 'Wedding Planner' },
  { id: '8', name: 'Florist' },
  { id: '9', name: 'Bridal Mehndi' },
  { id: '10', name: 'Transportation' },
];

const samplePackages: Package[] = [
  { id: '1', name: 'Basic Wedding Package' },
  { id: '2', name: 'Premium Wedding Package' },
  { id: '3', name: 'Luxury Wedding Package' },
  { id: '4', name: 'Engagement Package' },
  { id: '5', name: 'Haldi Package' },
  { id: '6', name: 'Sangeet Package' },
  { id: '7', name: 'Destination Wedding Package' },
];

// Custom Select Component with scrollable dropdown
const ScrollableSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder,
  height = "max-h-48"
}: { 
  value: string; 
  onChange: (value: string) => void; 
  options: string[]; 
  placeholder?: string;
  height?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 text-left flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder || 'Select an option'}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className={`absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto ${height}`}>
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-left text-sm hover:bg-orange-50 transition-colors ${
                  value === option ? 'bg-orange-100 text-orange-700' : 'text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Simple WYSIWYG toolbar component
const TextEditor = ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) => {
  const [isPreview, setIsPreview] = useState(false);

  const applyFormat = (format: string) => {
    const textarea = document.getElementById('editor-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let wrappedText = '';

    switch (format) {
      case 'bold':
        wrappedText = `**${selectedText}**`;
        break;
      case 'italic':
        wrappedText = `*${selectedText}*`;
        break;
      case 'heading':
        wrappedText = `\n## ${selectedText}\n`;
        break;
      case 'link':
        wrappedText = `[${selectedText}](url)`;
        break;
      case 'list':
        wrappedText = `\n- ${selectedText}`;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + wrappedText + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + wrappedText.length, start + wrappedText.length);
    }, 0);
  };

  const renderPreview = () => {
    let content = value;
    // Basic markdown to HTML preview
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    content = content.replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-orange-500 underline">$1</a>');
    content = content.replace(/\n- (.*?)(\n|$)/g, '<li class="ml-4">• $1</li>');
    content = content.replace(/\n\n/g, '</p><p>');
    content = `<p>${content}</p>`;
    
    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex gap-1">
          <button type="button" onClick={() => applyFormat('bold')} className="p-1.5 rounded hover:bg-gray-200 font-bold text-sm">B</button>
          <button type="button" onClick={() => applyFormat('italic')} className="p-1.5 rounded hover:bg-gray-200 italic text-sm">I</button>
          <button type="button" onClick={() => applyFormat('heading')} className="p-1.5 rounded hover:bg-gray-200 text-sm">H2</button>
          <button type="button" onClick={() => applyFormat('link')} className="p-1.5 rounded hover:bg-gray-200 text-sm">🔗</button>
          <button type="button" onClick={() => applyFormat('list')} className="p-1.5 rounded hover:bg-gray-200 text-sm">• List</button>
        </div>
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50"
        >
          <Eye size={12} />
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
      {isPreview ? (
        <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto bg-white">
          {value ? renderPreview() : <p className="text-gray-400 italic">Preview will appear here...</p>}
        </div>
      ) : (
        <textarea
          id="editor-content"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 text-sm focus:outline-none resize-y font-mono"
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Tips for Planning the Perfect Wedding',
    slug: '10-tips-for-planning-the-perfect-wedding',
    excerpt: 'Discover essential tips to make your wedding day unforgettable...',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    cover_image: 'https://images.unsplash.com/photo-1519741497674-611481863552',
    category: 'Tips & Advice',
    tags: ['Wedding', 'Planning', 'Tips'],
    status: 'published',
    is_featured: true,
    author_name: 'Sarah Johnson',
    author_avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    author_bio: 'Wedding planner with 10+ years of experience',
    meta_title: '10 Wedding Planning Tips',
    meta_description: 'Essential tips for planning your perfect wedding day',
    og_image: 'https://images.unsplash.com/photo-1519741497674-611481863552',
    published_at: '2024-03-15T10:00:00',
    read_time: 5,
    related_services: ['1', '2'],
    related_packages: ['1'],
  },
  {
    id: '2',
    title: 'Top Wedding Venues in 2024',
    slug: 'top-wedding-venues-in-2024',
    excerpt: 'Explore the most stunning wedding venues for your special day...',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    cover_image: 'https://images.unsplash.com/photo-1464366400600-7168b6af0bc1',
    category: 'Venues',
    tags: ['Venues', 'Destination Wedding', 'Luxury'],
    status: 'published',
    is_featured: true,
    author_name: 'Michael Chen',
    author_avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    author_bio: 'Luxury wedding venue specialist',
    meta_title: 'Best Wedding Venues 2024',
    meta_description: 'Top wedding venues for your dream celebration',
    og_image: 'https://images.unsplash.com/photo-1464366400600-7168b6af0bc1',
    published_at: '2024-03-20T14:30:00',
    read_time: 7,
    related_services: ['5'],
    related_packages: ['1', '2'],
  },
  {
    id: '3',
    title: 'Latest Wedding Fashion Trends',
    slug: 'latest-wedding-fashion-trends',
    excerpt: 'Stay updated with the hottest wedding fashion trends...',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    cover_image: 'https://images.unsplash.com/photo-1532712938312-48d7fa1cecd4',
    category: 'Fashion',
    tags: ['Fashion', 'Bridal', 'Trending'],
    status: 'draft',
    is_featured: false,
    author_name: 'Emma Watson',
    author_avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    author_bio: 'Fashion editor and wedding stylist',
    meta_title: 'Wedding Fashion Trends 2024',
    meta_description: 'Latest trends in wedding fashion',
    og_image: 'https://images.unsplash.com/photo-1532712938312-48d7fa1cecd4',
    published_at: '',
    read_time: 4,
    related_services: ['6'],
    related_packages: [],
  },
];

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BlogPost | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [relatedServiceInput, setRelatedServiceInput] = useState('');
  const [relatedPackageInput, setRelatedPackageInput] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => {
    // Simulate fetching post data
    const post = samplePosts.find(p => p.id === params.id);
    if (post) {
      setForm(post);
      if (post.cover_image) {
        setCoverPreview(post.cover_image);
      }
    } else {
      toast.error('Post not found');
      router.push('/admin/blog');
    }
  }, [params.id, router]);

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleContentChange = (content: string) => {
    if (form) {
      const readTime = calculateReadTime(content);
      setForm({ ...form, content, read_time: readTime });
    }
  };

  const handleTitleChange = (title: string) => {
    if (form) {
      const slug = generateSlug(title);
      setForm({ ...form, title, slug });
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setCoverPreview(imageUrl);
        setForm(prev => prev ? { ...prev, cover_image: imageUrl } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredTags = tagOptions.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && form && !form.tags.includes(tag)
  );

  const addTag = (tag: string) => {
    if (form && tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const removeTag = (tagToRemove: string) => {
    if (form) {
      setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
    }
  };

  const addRelatedService = (serviceId: string) => {
    if (form && serviceId && !form.related_services.includes(serviceId)) {
      setForm({ ...form, related_services: [...form.related_services, serviceId] });
    }
    setRelatedServiceInput('');
  };

  const removeRelatedService = (serviceId: string) => {
    if (form) {
      setForm({ ...form, related_services: form.related_services.filter(id => id !== serviceId) });
    }
  };

  const addRelatedPackage = (packageId: string) => {
    if (form && packageId && !form.related_packages.includes(packageId)) {
      setForm({ ...form, related_packages: [...form.related_packages, packageId] });
    }
    setRelatedPackageInput('');
  };

  const removeRelatedPackage = (packageId: string) => {
    if (form) {
      setForm({ ...form, related_packages: form.related_packages.filter(id => id !== packageId) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form?.title || !form?.content) {
      toast.error('Please fill title and content');
      setLoading(false);
      return;
    }

    // Slug is generated server-side
    const submitData = { ...form };
    delete submitData.slug;

    // Simulate API call
    setTimeout(() => {
      toast.success('Blog post updated successfully!');
      setLoading(false);
      router.push('/admin/blog');
    }, 500);
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-gray-900">Edit Post</h1>
            <p className="text-sm text-gray-500 mt-0.5">Update your blog post</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Article Fields */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={18} /> Core Article Fields
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input 
                label="Title" 
                value={form.title} 
                onChange={e => handleTitleChange(e.target.value)} 
                placeholder="Enter post title"
                required 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt (Short Summary)</label>
              <TextEditor 
                value={form.excerpt} 
                onChange={(value) => setForm({ ...form, excerpt: value })} 
                placeholder="Write a brief summary of your post..."
              />
              <p className="text-xs text-gray-400 mt-1">{form.excerpt.length}/160 characters (approx)</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
              <TextEditor 
                value={form.content} 
                onChange={handleContentChange} 
                placeholder="Write your blog content here... (Supports **bold**, *italic*, ## Headings, [links](url), and lists)"
              />
              <p className="text-xs text-gray-400 mt-1">Read time: {form.read_time} minutes (auto-calculated)</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image</label>
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 transition-colors bg-gray-50 overflow-hidden">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImageIcon size={24} className="text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="hidden" />
                </label>
                {coverPreview && (
                  <button
                    type="button"
                    onClick={() => { setCoverPreview(''); setForm({ ...form, cover_image: '' }); }}
                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Upload a cover image (JPG, PNG, WEBP)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <ScrollableSelect
                value={form.category}
                onChange={(value) => setForm({ ...form, category: value })}
                options={categoryOptions}
                height="max-h-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
              <div className="relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        setShowTagDropdown(true);
                      }}
                      onFocus={() => setShowTagDropdown(true)}
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter') { 
                          e.preventDefault(); 
                          if (filteredTags.length > 0) {
                            addTag(filteredTags[0]);
                          } else if (tagInput && form && !form.tags.includes(tagInput)) {
                            addTag(tagInput);
                          }
                        } 
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Type to search or add tag..."
                    />
                    {showTagDropdown && filteredTags.length > 0 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTagDropdown(false)} />
                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {filteredTags.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              className="w-full px-3.5 py-2 text-left text-sm hover:bg-orange-50 transition-colors text-gray-700"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <Button type="button" variant="secondary" onClick={() => tagInput && addTag(tagInput)} className="!px-4">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {form.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-orange-900">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select 
                value={form.status} 
                onChange={e => setForm({ ...form, status: e.target.value as any })} 
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_featured"
                checked={form.is_featured}
                onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 focus:ring-offset-0"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">Feature this post</label>
            </div>
          </div>
        </div>

        {/* Author Fields */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} /> Author Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Author Name" 
              value={form.author_name} 
              onChange={e => setForm({ ...form, author_name: e.target.value })} 
              placeholder="John Doe"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Author Avatar</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 cursor-pointer hover:bg-gray-200 overflow-hidden flex-shrink-0">
                  {form.author_avatar ? (
                    <img src={form.author_avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Users size={16} className="text-gray-500" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setForm({ ...form, author_avatar: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" />
                </label>
                <Input 
                  value={form.author_avatar} 
                  onChange={e => setForm({ ...form, author_avatar: e.target.value })} 
                  placeholder="Or image URL"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Author Bio</label>
              <textarea 
                value={form.author_bio} 
                onChange={e => setForm({ ...form, author_bio: e.target.value })} 
                rows={3}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Brief bio about the author"
              />
            </div>
          </div>
        </div>

        {/* Publishing Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={18} /> Publishing Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Published Date" 
              type="datetime-local" 
              value={form.published_at?.slice(0, 16) || ''} 
              onChange={e => setForm({ ...form, published_at: e.target.value })} 
            />
            <Input 
              label="Read Time (minutes)" 
              type="number" 
              value={form.read_time} 
              onChange={e => setForm({ ...form, read_time: Number(e.target.value) })} 
            />
          </div>
        </div>

        {/* Related Services & Packages */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Layers size={18} /> Related Services & Packages
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Related Services</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <select 
                    value={relatedServiceInput} 
                    onChange={e => setRelatedServiceInput(e.target.value)} 
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                  >
                    <option value="">Select a service</option>
                    {sampleServices.filter(s => !form.related_services.includes(s.id)).map(service => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <Button type="button" variant="secondary" onClick={() => addRelatedService(relatedServiceInput)} className="!px-4">
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 max-h-32 overflow-y-auto">
                {sampleServices.filter(s => form.related_services.includes(s.id)).map(service => (
                  <span key={service.id} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center gap-1 border border-blue-200">
                    {service.name}
                    <button type="button" onClick={() => removeRelatedService(service.id)} className="hover:text-blue-900">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Related Packages</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <select 
                    value={relatedPackageInput} 
                    onChange={e => setRelatedPackageInput(e.target.value)} 
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                  >
                    <option value="">Select a package</option>
                    {samplePackages.filter(p => !form.related_packages.includes(p.id)).map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                    ))}
                  </select>
                </div>
                <Button type="button" variant="secondary" onClick={() => addRelatedPackage(relatedPackageInput)} className="!px-4">
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 max-h-32 overflow-y-auto">
                {samplePackages.filter(p => form.related_packages.includes(p.id)).map(pkg => (
                  <span key={pkg.id} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs flex items-center gap-1 border border-green-200">
                    {pkg.name}
                    <button type="button" onClick={() => removeRelatedPackage(pkg.id)} className="hover:text-green-900">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {loading ? 'Updating...' : 'Update Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}