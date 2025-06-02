# NomNoms - Feature Roadmap

## 🎯 Vision
Transform NomNoms from a simple recipe viewer into a comprehensive personal cooking companion that helps users organize, plan, and enhance their cooking experience.

## 🏗️ Core Foundation (In Progress)
- [x] File-based recipe storage
- [x] Recipe search and filtering
- [x] Recipe scaling functionality
- [x] User authentication (NextAuth.js)
- [ ] **Database Migration** - Move from JSON files to PostgreSQL with Prisma
- [ ] User-owned recipes with public/private visibility

---

## 🍳 Planned Features

### Phase 1: Recipe Organization (Q3 2025)

#### Recipe Collections/Cookbooks
**Goal**: Allow users to organize recipes into themed collections
- Create custom collections (e.g., "Weeknight Dinners", "Holiday Baking")
- Add/remove recipes from multiple collections
- Share collections publicly or keep private
- Collection templates (Meal Prep, Date Night, etc.)

**Technical**: Collection model with many-to-many relationship to recipes

#### Favorite Recipes System
**Goal**: Quick access to preferred recipes
- One-click favorite/unfavorite
- Dedicated favorites page
- Sort favorites by recently added, most cooked, etc.
- Export favorites to collection

**Technical**: UserFavorite junction table

#### Recipe Forking & Variations
**Goal**: Enable recipe customization and sharing improvements
- "Fork" existing recipes to create personal variations
- Track parent-child recipe relationships
- Compare versions side-by-side
- Suggest popular modifications from community forks

**Technical**: Self-referencing Recipe model with parentId

### Phase 2: Personal Cooking Assistant (Q4 2025)

#### Personal Recipe Notes
**Goal**: Track personal modifications and cooking experiences
- Add private notes to any recipe
- Rate personal satisfaction (separate from public ratings)
- Track modifications made ("used honey instead of sugar")
- Cooking tips and reminders
- Photo upload for personal results

**Technical**: RecipeNote model linked to user and recipe

#### Cooking History Tracking
**Goal**: Remember what you've cooked and when
- Automatic "cooked this" tracking
- Manual entry for past cooking
- Cooking frequency analytics
- "What to cook next" suggestions based on history
- Seasonal cooking patterns

**Technical**: CookingHistory model with timestamps

#### Ingredient Substitutions
**Goal**: Flexible cooking with available ingredients
- Built-in substitution database (1 cup butter = 3/4 cup oil)
- Personal substitution notes
- Automatic scaling of substitutions
- Dietary restriction substitutions (gluten-free, vegan)
- "What can I make with..." ingredient search

**Technical**: IngredientSubstitution model with flexible matching

### Phase 3: Meal Planning & Shopping (Q1 2026)

#### Meal Planning Calendar
**Goal**: Plan meals in advance and reduce decision fatigue
- Drag-and-drop recipe scheduling
- Weekly/monthly meal planning views
- Repeat favorite meal plans
- Family member meal preferences
- Leftover tracking and planning
- Export meal plans to calendar apps

**Technical**: MealPlan model with date scheduling

#### Smart Shopping Lists
**Goal**: Streamline grocery shopping from meal plans
- Auto-generate shopping lists from planned meals
- Consolidate duplicate ingredients
- Organize by store sections
- Check off items with mobile-friendly interface
- Share shopping lists with family
- Integration with grocery pickup services

**Technical**: ShoppingList model with ingredient aggregation

#### Recipe Import from URLs
**Goal**: Easily add recipes from cooking websites
- Parse recipe structured data (JSON-LD, microdata)
- Import from popular cooking sites
- Clean up formatting automatically
- Detect and convert imperial/metric units
- Import recipe images
- Batch import from bookmarks

**Technical**: Recipe scraping service with URL parsing

### Phase 4: Social & Discovery (Q2 2026)

#### Recipe Sharing & Discovery
**Goal**: Find and share great recipes with others
- Public recipe feed with filtering
- Recipe of the day/week features
- Trending recipes based on cooking frequency
- Recipe recommendations based on preferences
- QR code sharing for quick recipe access

#### Community Features (Optional)
**Goal**: Connect with other home cooks
- Follow other users
- Recipe comments and tips
- Community recipe challenges
- Regional cuisine exploration
- Seasonal recipe suggestions

---

## 🔧 Technical Considerations

### Database Design Principles
- **Extensible schema**: Design models to accommodate future features
- **Performance first**: Index frequently queried fields
- **Data integrity**: Proper foreign keys and constraints
- **Privacy by default**: User data protection built-in

### API Design
- **RESTful endpoints**: Consistent API patterns
- **GraphQL consideration**: For complex relationship queries
- **Rate limiting**: Protect against abuse
- **Caching strategy**: Redis for frequently accessed data

### Frontend Architecture
- **Component-driven**: Reusable UI components
- **Progressive enhancement**: Works without JavaScript
- **Mobile-first**: Responsive design for kitchen use
- **Offline capability**: Service worker for recipe access

### Infrastructure
- **Scalable hosting**: Vercel for frontend, managed PostgreSQL
- **Image optimization**: Cloudinary or similar for recipe photos
- **Search enhancement**: Algolia or ElasticSearch for advanced recipe search
- **Analytics**: Track feature usage and optimize UX

---

## 📊 Success Metrics

### User Engagement
- Daily/monthly active users
- Recipes cooked per user per month
- Time spent in app
- Feature adoption rates

### Content Quality
- User-generated recipe ratings
- Recipe completion rates
- Search success rates
- Import success rates

### Technical Performance
- Page load times
- API response times
- Search response times
- Mobile performance scores

---

## 🤝 Contributing

Each feature will be developed as a separate epic with detailed user stories and acceptance criteria. Community feedback and feature requests are welcome through GitHub issues.

### Feature Request Process
1. Open GitHub issue with "Feature Request" label
2. Describe user problem and proposed solution
3. Community discussion and refinement
4. Technical design review
5. Implementation planning
6. Development and testing
7. User feedback and iteration

---

## 📝 Notes

- **Prioritization**: Features may be reprioritized based on user feedback
- **Technical debt**: Regular refactoring scheduled between feature releases
- **Performance**: Each phase includes performance optimization
- **Testing**: Comprehensive test coverage required for all features
- **Documentation**: User guides and developer docs updated with each release
