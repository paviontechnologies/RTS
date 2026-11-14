package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"
)

// CandidateProfile represents a candidate record in the ATS
type CandidateProfile struct {
	ID                string   `json:"id"`
	FullName          string   `json:"full_name"`
	Email             string   `json:"email"`
	Phone             string   `json:"phone"`
	WorkAuthorization string   `json:"work_authorization"`
	TotalExperience   float64  `json:"total_experience"`
	Skills            []string `json:"skills"`
	CurrentTitle      string   `json:"current_title"`
}

// InvertedIndex maps skills and keywords to candidate IDs
type InvertedIndex struct {
	mu         sync.RWMutex
	index      map[string][]string
	candidates map[string]CandidateProfile
}

// NewInvertedIndex initializes an empty index
func NewInvertedIndex() *InvertedIndex {
	return &InvertedIndex{
		index:      make(map[string][]string),
		candidates: make(map[string]CandidateProfile),
	}
}

// AddCandidate indexes a candidate's profile and skills
func (idx *InvertedIndex) AddCandidate(c CandidateProfile) {
	idx.mu.Lock()
	defer idx.mu.Unlock()

	idx.candidates[c.ID] = c

	// Index each skill
	for _, skill := range c.Skills {
		norm := strings.ToLower(strings.TrimSpace(skill))
		if norm != "" {
			idx.index[norm] = append(idx.index[norm], c.ID)
		}
	}

	// Index words in job title
	for _, word := range strings.Fields(strings.ToLower(c.CurrentTitle)) {
		if len(word) > 2 {
			idx.index[word] = append(idx.index[word], c.ID)
		}
	}
}

// Search finds candidates matching all required skills
func (idx *InvertedIndex) Search(skills []string) []CandidateProfile {
	idx.mu.RLock()
	defer idx.mu.RUnlock()

	if len(skills) == 0 {
		return nil
	}

	idCounts := make(map[string]int)
	for _, s := range skills {
		norm := strings.ToLower(strings.TrimSpace(s))
		seenInSkill := make(map[string]bool)
		for _, id := range idx.index[norm] {
			if !seenInSkill[id] {
				idCounts[id]++
				seenInSkill[id] = true
			}
		}
	}

	var results []CandidateProfile
	for id, count := range idCounts {
		if count == len(skills) {
			if cand, exists := idx.candidates[id]; exists {
				results = append(results, cand)
			}
		}
	}
	return results
}

func main() {
	fmt.Println("=== Pavion RTS High-Speed ATS Inverted Search Indexer (Go) ===")
	indexer := NewInvertedIndex()

	// Sample candidate benchmark indexing
	sampleCandidates := []CandidateProfile{
		{
			ID:                "cand_001",
			FullName:          "Aarav Sharma",
			Email:             "aarav.sharma@example.com",
			WorkAuthorization: "US Citizen",
			TotalExperience:   8.5,
			Skills:            []string{"Go", "Python", "Kubernetes", "AWS", "PostgreSQL"},
			CurrentTitle:      "Senior Cloud Infrastructure Engineer",
		},
		{
			ID:                "cand_002",
			FullName:          "Priya Patel",
			Email:             "priya.patel@example.com",
			WorkAuthorization: "Green Card",
			TotalExperience:   6.0,
			Skills:            []string{"Python", "FastAPI", "React", "PostgreSQL", "Docker"},
			CurrentTitle:      "Lead Full Stack Developer",
		},
		{
			ID:                "cand_003",
			FullName:          "Rohan Gupta",
			Email:             "rohan.gupta@example.com",
			WorkAuthorization: "H-1B",
			TotalExperience:   7.0,
			Skills:            []string{"Java", "Spring Boot", "AWS", "Kafka", "Microservices"},
			CurrentTitle:      "Senior Java Cloud Architect",
		},
	}

	start := time.Now()
	for _, c := range sampleCandidates {
		indexer.AddCandidate(c)
	}
	fmt.Printf("[OK] Successfully indexed %d candidates in %v\n", len(sampleCandidates), time.Since(start))

	searchQuery := []string{"Python", "PostgreSQL"}
	fmt.Printf("--> Querying candidates with skills: %v\n", searchQuery)
	matches := indexer.Search(searchQuery)
	fmt.Printf("[RESULT] Found %d matching candidates:\n", len(matches))
	for i, m := range matches {
		fmt.Printf("  %d. %s (%s) - Title: %s, Exp: %.1f yrs\n", i+1, m.FullName, m.WorkAuthorization, m.CurrentTitle, m.TotalExperience)
	}

	if len(os.Args) > 1 && os.Args[1] == "--json" {
		data, _ := json.MarshalIndent(matches, "", "  ")
		fmt.Println(string(data))
	}
}
