import { useQuery } from "@tanstack/react-query";
import { Laptop } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedLaptopsSection() {
  const { data: laptops, isLoading, error } = useQuery<Laptop[]>({
    queryKey: ["/api/laptops"],
  });

  // Only show approved laptops that are not sold
  const featuredLaptops = laptops?.filter(laptop => laptop.status === 'approved').slice(0, 3);

  // Convert price from cents to naira
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const renderLaptopCard = (laptop: Laptop) => (
    <div key={laptop.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
      <div className="relative pb-[65%]">
        <img 
          src={laptop.images[0]} 
          alt={laptop.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 py-1 px-3 rounded-full text-sm font-medium">
          Featured
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{laptop.title}</h3>
          <div className="text-lg font-bold text-blue-700">{formatPrice(laptop.price)}</div>
        </div>
        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            {laptop.processor}, {laptop.ram}, {laptop.storage}, {laptop.condition} condition
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 text-xs py-1 px-2 rounded-full">Verified Seller</div>
          </div>
          <Link href={`/laptops/${laptop.id}`}>
            <Button variant="link" className="text-blue-700 hover:text-blue-800 p-0">
              View Details →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderSkeleton = () => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Skeleton className="w-full h-56" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-7 w-1/4" />
        </div>
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Laptops</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse some of our top-rated laptops available for purchase.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i}>{renderSkeleton()}</div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            Failed to load featured laptops. Please try again later.
          </div>
        ) : featuredLaptops && featuredLaptops.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredLaptops.map(laptop => renderLaptopCard(laptop))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No featured laptops available at the moment.</p>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-700 hover:bg-blue-800">
              View All Laptops
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
