
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MediaType } from "@/types";

interface Genre {
  id: number;
  name: string;
}

interface GenreFiltersProps {
  genres: Genre[];
  selectedGenre: string | null;
  onGenreChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  minRating: number;
  onRatingChange: (value: number[]) => void;
  includeAdult: boolean;
  onAdultContentChange: (checked: boolean) => void;
  yearFilter: string;
  onYearChange: (value: string) => void;
  onResetFilters: () => void;
  mediaType: MediaType;
}

export function GenreFilters({
  genres,
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortChange,
  minRating,
  onRatingChange,
  includeAdult,
  onAdultContentChange,
  yearFilter,
  onYearChange,
  onResetFilters,
  mediaType
}: GenreFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());
  
  return (
    <div className="space-y-6 sticky top-6">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">Genre</label>
        <Select value={selectedGenre || ""} onValueChange={onGenreChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.id.toString()}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedGenre && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity.desc">Popularity (High to Low)</SelectItem>
                <SelectItem value="popularity.asc">Popularity (Low to High)</SelectItem>
                <SelectItem value="vote_average.desc">Rating (High to Low)</SelectItem>
                <SelectItem value="vote_average.asc">Rating (Low to High)</SelectItem>
                <SelectItem value="release_date.desc">Release Date (Newest)</SelectItem>
                <SelectItem value="release_date.asc">Release Date (Oldest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <Select value={yearFilter} onValueChange={onYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Rating: {minRating}</label>
            <Slider
              value={[minRating]}
              min={0}
              max={10}
              step={0.5}
              onValueChange={onRatingChange}
              className="my-4"
            />
            <div className="flex justify-between text-xs">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="adult-content"
              checked={includeAdult} 
              onCheckedChange={(checked) => {
                onAdultContentChange(checked === true);
              }}
            />
            <Label htmlFor="adult-content">Include Adult Content</Label>
          </div>
          
          <Separator />
          
          <Button 
            onClick={onResetFilters}
            variant="outline"
            className="w-full"
          >
            Reset Filters
          </Button>
        </>
      )}
    </div>
  );
}
