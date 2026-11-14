package main

import (
	"testing"
)

func TestInvertedIndex(t *testing.T) {
	idx := NewInvertedIndex()

	c1 := CandidateProfile{
		ID:              "c1",
		FullName:        "Test Engineer",
		Skills:          []string{"Go", "Docker", "AWS"},
		TotalExperience: 5.0,
	}
	c2 := CandidateProfile{
		ID:              "c2",
		FullName:        "Frontend Engineer",
		Skills:          []string{"React", "TypeScript"},
		TotalExperience: 3.0,
	}

	idx.AddCandidate(c1)
	idx.AddCandidate(c2)

	// Search single skill
	res1 := idx.Search([]string{"Go"})
	if len(res1) != 1 || res1[0].ID != "c1" {
		t.Fatalf("expected 1 result with ID c1, got %v", res1)
	}

	// Search multiple skills
	res2 := idx.Search([]string{"Go", "AWS"})
	if len(res2) != 1 || res2[0].ID != "c1" {
		t.Fatalf("expected 1 result with ID c1, got %v", res2)
	}

	// Search missing skill
	res3 := idx.Search([]string{"Go", "React"})
	if len(res3) != 0 {
		t.Fatalf("expected 0 results, got %v", res3)
	}
}
