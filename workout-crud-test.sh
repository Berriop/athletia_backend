#!/bin/bash

# ============================================
# ATHLETIA - WORKOUT CRUD cURL EXAMPLES
# ============================================

# CONFIGURACIÓN
BASE_URL="http://localhost:3000/api/v1"
EMAIL="athlete@test.com"
PASSWORD="password123"

# COLORES
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🏋️  ATHLETIA WORKOUT CRUD cURL GUIDE${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ============================================
# 1. REGISTER USER
# ============================================
echo -e "${YELLOW}1. REGISTERING USER...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'",
    "name": "Test Athlete"
  }')

echo $REGISTER_RESPONSE | jq .
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
echo -e "${GREEN}✓ Token saved: $TOKEN${NC}\n"

# ============================================
# 2. CREATE WORKOUT
# ============================================
echo -e "${YELLOW}2. CREATING WORKOUT...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/workouts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Upper Body Day",
    "description": "Chest, back and shoulders",
    "bodyPart": "Chest",
    "durationMinutes": 45,
    "energyLevel": 8,
    "fatigueLevel": 6,
    "painLevel": 1,
    "date": "2026-05-31T09:00:00Z"
  }')

echo $CREATE_RESPONSE | jq .
WORKOUT_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')
echo -e "${GREEN}✓ Workout ID saved: $WORKOUT_ID${NC}\n"

# ============================================
# 3. GET ALL WORKOUTS
# ============================================
echo -e "${YELLOW}3. GETTING ALL WORKOUTS...${NC}"
curl -s -X GET "$BASE_URL/workouts" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# ============================================
# 4. GET ALL WORKOUTS WITH PAGINATION
# ============================================
echo -e "${YELLOW}4. GETTING WORKOUTS WITH PAGINATION...${NC}"
curl -s -X GET "$BASE_URL/workouts?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# ============================================
# 5. GET ALL WORKOUTS WITH FILTERS
# ============================================
echo -e "${YELLOW}5. GETTING WORKOUTS WITH FILTERS...${NC}"
curl -s -X GET "$BASE_URL/workouts?bodyPart=Chest&date=2026-05-31" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# ============================================
# 6. GET WORKOUT BY ID
# ============================================
echo -e "${YELLOW}6. GETTING WORKOUT BY ID...${NC}"
curl -s -X GET "$BASE_URL/workouts/$WORKOUT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# ============================================
# 7. UPDATE WORKOUT
# ============================================
echo -e "${YELLOW}7. UPDATING WORKOUT...${NC}"
curl -s -X PUT "$BASE_URL/workouts/$WORKOUT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Upper Body Day - Updated",
    "durationMinutes": 60,
    "energyLevel": 9
  }' | jq .
echo -e "\n"

# ============================================
# 8. CREATE ANOTHER WORKOUT
# ============================================
echo -e "${YELLOW}8. CREATING ANOTHER WORKOUT...${NC}"
CREATE_RESPONSE_2=$(curl -s -X POST "$BASE_URL/workouts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lower Body Day",
    "description": "Legs and glutes",
    "bodyPart": "Legs",
    "durationMinutes": 50,
    "energyLevel": 7,
    "fatigueLevel": 8,
    "painLevel": 2,
    "date": "2026-05-31T16:00:00Z"
  }')

echo $CREATE_RESPONSE_2 | jq .
WORKOUT_ID_2=$(echo $CREATE_RESPONSE_2 | jq -r '.data.id')
echo -e "${GREEN}✓ Workout 2 ID saved: $WORKOUT_ID_2${NC}\n"

# ============================================
# 9. GET ALL WORKOUTS AGAIN
# ============================================
echo -e "${YELLOW}9. GETTING ALL WORKOUTS AGAIN (should be 2)...${NC}"
curl -s -X GET "$BASE_URL/workouts" \
  -H "Authorization: Bearer $TOKEN" | jq '.meta'
echo -e "\n"

# ============================================
# 10. DELETE WORKOUT
# ============================================
echo -e "${YELLOW}10. DELETING FIRST WORKOUT...${NC}"
curl -s -X DELETE "$BASE_URL/workouts/$WORKOUT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo -e "\n"

# ============================================
# 11. VERIFY DELETION
# ============================================
echo -e "${YELLOW}11. VERIFYING DELETION (should show 1 workout)...${NC}"
curl -s -X GET "$BASE_URL/workouts" \
  -H "Authorization: Bearer $TOKEN" | jq '.meta'
echo -e "\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All tests completed!${NC}"
echo -e "${GREEN}========================================${NC}"
