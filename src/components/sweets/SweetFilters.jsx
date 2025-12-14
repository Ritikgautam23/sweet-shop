import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { categories } from '@/data/mockSweets';

export function SweetFilters({ filters, onFiltersChange, maxPrice }) {
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateCategories = (category, checked) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    updateFilter('categories', newCategories);
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      categories: [],
      minPrice: 0,
      maxPrice: maxPrice,
      minRating: 0,
      dateFrom: '',
      dateTo: '',
      sortBy: 'name',
      inStock: false,
    });
    setDebouncedSearch('');
  };

  const activeFiltersCount = [
    filters.search,
    filters.categories.length > 0,
    filters.minPrice > 0,
    filters.maxPrice < maxPrice,
    filters.minRating > 0,
    filters.dateFrom,
    filters.dateTo,
    filters.inStock,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sweets..."
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          className="pl-10 bg-secondary border-border"
        />
      </div>

      {/* Rating Filter */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant={filters.minRating >= star ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('minRating', filters.minRating >= star ? star - 1 : star)}
            className="p-1 h-8 w-8"
          >
            <Star className="h-4 w-4" fill={filters.minRating >= star ? 'currentColor' : 'none'} />
          </Button>
        ))}
      </div>

      {/* Sort Select */}
      <Select
        value={filters.sortBy}
        onValueChange={(value) => updateFilter('sortBy', value)}
      >
        <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Category, Name A-Z</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="newest">Newest First</SelectItem>
        </SelectContent>
      </Select>

      {/* More Filters Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine your sweet selection</SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Categories */}
            <div className="space-y-4">
              <Label>Categories</Label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.value}
                      checked={filters.categories.includes(category.value)}
                      onCheckedChange={(checked) => updateCategories(category.value, checked)}
                    />
                    <Label htmlFor={category.value} className="text-sm">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <Label>Price Range</Label>
              <Slider
                min={0}
                max={maxPrice}
                step={1}
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={([min, max]) => {
                  onFiltersChange({ ...filters, minPrice: min, maxPrice: max });
                }}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${filters.minPrice}</span>
                <span>${filters.maxPrice}</span>
              </div>
            </div>

            {/* Date Added */}
            <div className="space-y-4">
              <Label>Date Added</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      {filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                      onSelect={(date) => updateFilter('dateFrom', date ? date.toISOString().split('T')[0] : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      {filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                      onSelect={(date) => updateFilter('dateTo', date ? date.toISOString().split('T')[0] : '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* In Stock Only */}
            <div className="flex items-center justify-between">
              <div>
                <Label>In Stock Only</Label>
                <p className="text-sm text-muted-foreground">Hide out-of-stock items</p>
              </div>
              <Switch
                checked={filters.inStock}
                onCheckedChange={(checked) => updateFilter('inStock', checked)}
              />
            </div>

            {/* Clear All Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={resetFilters}
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  updateFilter('search', '');
                  setDebouncedSearch('');
                }}
              />
            </Badge>
          )}
          {filters.categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {categories.find(c => c.value === cat)?.label || cat}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateCategories(cat, false)}
              />
            </Badge>
          ))}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              Rating: {filters.minRating}+ stars
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('minRating', 0)}
              />
            </Badge>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              Price: ${filters.minPrice} - ${filters.maxPrice}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, minPrice: 0, maxPrice: maxPrice })}
              />
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1">
              From: {new Date(filters.dateFrom).toLocaleDateString()}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('dateFrom', '')}
              />
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1">
              To: {new Date(filters.dateTo).toLocaleDateString()}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('dateTo', '')}
              />
            </Badge>
          )}
          {filters.inStock && (
            <Badge variant="secondary" className="gap-1">
              In Stock
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('inStock', false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
