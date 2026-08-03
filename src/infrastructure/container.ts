// Repositories
import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { PrismaWorkoutRepository } from './repositories/PrismaWorkoutRepository';
import { PrismaMealRepository } from './repositories/PrismaMealRepository';
import { PrismaSleepRepository } from './repositories/PrismaSleepRepository';
import { PrismaInjuryRepository } from './repositories/PrismaInjuryRepository';

// Security & Infrastructure Services
import { BcryptService } from './security/BcryptService';
import { JwtService } from './security/JwtService';
import { GoogleMapsGymService } from './services/GoogleMapsGymService';

// Auth Use Cases
import { RegisterUseCase } from '../application/use-cases/RegisterUseCase';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { GetMeUseCase } from '../application/use-cases/GetMeUseCase';
import { UpdateProfileUseCase } from '../application/use-cases/UpdateProfileUseCase';

// Workout Use Cases
import { CreateWorkoutUseCase } from '../application/use-cases/workout/CreateWorkoutUseCase';
import { GetWorkoutsUseCase } from '../application/use-cases/workout/GetWorkoutsUseCase';
import { GetWorkoutByIdUseCase } from '../application/use-cases/workout/GetWorkoutByIdUseCase';
import { UpdateWorkoutUseCase } from '../application/use-cases/workout/UpdateWorkoutUseCase';
import { DeleteWorkoutUseCase } from '../application/use-cases/workout/DeleteWorkoutUseCase';

// Meal Use Cases
import { CreateMealUseCase } from '../application/use-cases/meal/CreateMealUseCase';
import { GetMealsUseCase } from '../application/use-cases/meal/GetMealsUseCase';
import { GetMealByIdUseCase } from '../application/use-cases/meal/GetMealByIdUseCase';
import { UpdateMealUseCase } from '../application/use-cases/meal/UpdateMealUseCase';
import { DeleteMealUseCase } from '../application/use-cases/meal/DeleteMealUseCase';

// Sleep Use Cases
import { CreateSleepUseCase } from '../application/use-cases/sleep/CreateSleepUseCase';
import { GetSleepsUseCase } from '../application/use-cases/sleep/GetSleepsUseCase';
import { GetSleepByIdUseCase } from '../application/use-cases/sleep/GetSleepByIdUseCase';
import { UpdateSleepUseCase } from '../application/use-cases/sleep/UpdateSleepUseCase';
import { DeleteSleepUseCase } from '../application/use-cases/sleep/DeleteSleepUseCase';

// Injury Use Cases
import { CreateInjuryUseCase } from '../application/use-cases/injury/CreateInjuryUseCase';
import { GetInjuriesUseCase } from '../application/use-cases/injury/GetInjuriesUseCase';
import { GetInjuryByIdUseCase } from '../application/use-cases/injury/GetInjuryByIdUseCase';
import { UpdateInjuryUseCase } from '../application/use-cases/injury/UpdateInjuryUseCase';
import { DeleteInjuryUseCase } from '../application/use-cases/injury/DeleteInjuryUseCase';

// Gym Use Cases
import { NearbyGymsUseCase } from '../application/use-cases/gym/NearbyGymsUseCase';
import { SearchGymsUseCase } from '../application/use-cases/gym/SearchGymsUseCase';

// Controllers
import { AuthController } from '../interface/controllers/AuthController';
import { WorkoutController } from '../interface/controllers/WorkoutController';
import { MealController } from '../interface/controllers/MealController';
import { SleepController } from '../interface/controllers/SleepController';
import { InjuryController } from '../interface/controllers/InjuryController';
import { GymController } from '../interface/controllers/GymController';

class Container {
  // Repositories
  public readonly userRepository = new PrismaUserRepository();
  public readonly workoutRepository = new PrismaWorkoutRepository();
  public readonly mealRepository = new PrismaMealRepository();
  public readonly sleepRepository = new PrismaSleepRepository();
  public readonly injuryRepository = new PrismaInjuryRepository();

  // Services
  public readonly hashService = new BcryptService();
  public readonly jwtService = new JwtService();
  public readonly googleMapsService = new GoogleMapsGymService();

  // Auth Use Cases
  public readonly registerUseCase = new RegisterUseCase(
    this.userRepository,
    this.hashService,
    this.jwtService,
  );
  public readonly loginUseCase = new LoginUseCase(
    this.userRepository,
    this.hashService,
    this.jwtService,
  );
  public readonly getMeUseCase = new GetMeUseCase(this.userRepository);
  public readonly updateProfileUseCase = new UpdateProfileUseCase(this.userRepository);

  // Workout Use Cases
  public readonly createWorkoutUseCase = new CreateWorkoutUseCase(this.workoutRepository);
  public readonly getWorkoutsUseCase = new GetWorkoutsUseCase(this.workoutRepository);
  public readonly getWorkoutByIdUseCase = new GetWorkoutByIdUseCase(this.workoutRepository);
  public readonly updateWorkoutUseCase = new UpdateWorkoutUseCase(this.workoutRepository);
  public readonly deleteWorkoutUseCase = new DeleteWorkoutUseCase(this.workoutRepository);

  // Meal Use Cases
  public readonly createMealUseCase = new CreateMealUseCase(this.mealRepository);
  public readonly getMealsUseCase = new GetMealsUseCase(this.mealRepository);
  public readonly getMealByIdUseCase = new GetMealByIdUseCase(this.mealRepository);
  public readonly updateMealUseCase = new UpdateMealUseCase(this.mealRepository);
  public readonly deleteMealUseCase = new DeleteMealUseCase(this.mealRepository);

  // Sleep Use Cases
  public readonly createSleepUseCase = new CreateSleepUseCase(this.sleepRepository);
  public readonly getSleepsUseCase = new GetSleepsUseCase(this.sleepRepository);
  public readonly getSleepByIdUseCase = new GetSleepByIdUseCase(this.sleepRepository);
  public readonly updateSleepUseCase = new UpdateSleepUseCase(this.sleepRepository);
  public readonly deleteSleepUseCase = new DeleteSleepUseCase(this.sleepRepository);

  // Injury Use Cases
  public readonly createInjuryUseCase = new CreateInjuryUseCase(this.injuryRepository);
  public readonly getInjuriesUseCase = new GetInjuriesUseCase(this.injuryRepository);
  public readonly getInjuryByIdUseCase = new GetInjuryByIdUseCase(this.injuryRepository);
  public readonly updateInjuryUseCase = new UpdateInjuryUseCase(this.injuryRepository);
  public readonly deleteInjuryUseCase = new DeleteInjuryUseCase(this.injuryRepository);

  // Gym Use Cases
  public readonly nearbyGymsUseCase = new NearbyGymsUseCase(this.googleMapsService);
  public readonly searchGymsUseCase = new SearchGymsUseCase(this.googleMapsService);

  // Controllers
  public readonly authController = new AuthController(
    this.registerUseCase,
    this.loginUseCase,
    this.getMeUseCase,
    this.updateProfileUseCase,
  );

  public readonly workoutController = new WorkoutController(
    this.createWorkoutUseCase,
    this.getWorkoutsUseCase,
    this.getWorkoutByIdUseCase,
    this.updateWorkoutUseCase,
    this.deleteWorkoutUseCase,
  );

  public readonly mealController = new MealController(
    this.createMealUseCase,
    this.getMealsUseCase,
    this.getMealByIdUseCase,
    this.updateMealUseCase,
    this.deleteMealUseCase,
  );

  public readonly sleepController = new SleepController(
    this.createSleepUseCase,
    this.getSleepsUseCase,
    this.getSleepByIdUseCase,
    this.updateSleepUseCase,
    this.deleteSleepUseCase,
  );

  public readonly injuryController = new InjuryController(
    this.createInjuryUseCase,
    this.getInjuriesUseCase,
    this.getInjuryByIdUseCase,
    this.updateInjuryUseCase,
    this.deleteInjuryUseCase,
  );

  public readonly gymController = new GymController(
    this.nearbyGymsUseCase,
    this.searchGymsUseCase,
  );
}

export const container = new Container();
