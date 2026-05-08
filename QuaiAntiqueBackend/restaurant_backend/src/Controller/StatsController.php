<?php

namespace App\Controller;

use App\Document\FoodConsultation;
use App\Document\MenuConsultation;
use App\Repository\FoodRepository;
use App\Repository\MenuRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/stats')]
class StatsController extends AbstractController
{
    public function __construct(
        private DocumentManager $documentManager,
        private FoodRepository $foodRepository,
        private MenuRepository $menuRepository
    ) {
    }


    #[Route('/food/{id}/view', name: 'api_stats_food_view', methods: ['POST'])]
    public function incrementFoodView(int $id): JsonResponse
    {
        
        $food = $this->foodRepository->find($id);
        
        if (!$food) {
            return $this->json(['error' => 'Plat non trouvé'], Response::HTTP_NOT_FOUND);
        }

       
        $repository = $this->documentManager->getRepository(FoodConsultation::class);
        $consultation = $repository->findOneBy(['foodId' => $id]);

        if (!$consultation) {
          
            $consultation = new FoodConsultation($id, $food->getTitle());
        } else {
          
            $consultation->incrementConsultation();
          
            $consultation->setFoodName($food->getTitle());
        }

        $this->documentManager->persist($consultation);
        $this->documentManager->flush();

        return $this->json([
            'foodId' => $id,
            'consultationCount' => $consultation->getConsultationCount(),
            'message' => 'Vue enregistrée'
        ]);
    }

   
    #[Route('/menu/{id}/view', name: 'api_stats_menu_view', methods: ['POST'])]
    public function incrementMenuView(int $id): JsonResponse
    {
       
        $menu = $this->menuRepository->find($id);
        
        if (!$menu) {
            return $this->json(['error' => 'Menu non trouvé'], Response::HTTP_NOT_FOUND);
        }

      
        $repository = $this->documentManager->getRepository(MenuConsultation::class);
        $consultation = $repository->findOneBy(['menuId' => $id]);

        if (!$consultation) {
            $consultation = new MenuConsultation($id, $menu->getTitle());
        } else {
            $consultation->incrementConsultation();
            $consultation->setMenuName($menu->getTitle());
        }

        $this->documentManager->persist($consultation);
        $this->documentManager->flush();

        return $this->json([
            'menuId' => $id,
            'consultationCount' => $consultation->getConsultationCount(),
            'message' => 'Vue enregistrée'
        ]);
    }

   
    #[Route('/foods', name: 'api_stats_foods', methods: ['GET'])]
    public function getFoodStats(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $repository = $this->documentManager->getRepository(FoodConsultation::class);
        $consultations = $repository->findAll();

        $data = array_map(function(FoodConsultation $consultation) {
            return [
                'foodId' => $consultation->getFoodId(),
                'foodName' => $consultation->getFoodName(),
                'consultationCount' => $consultation->getConsultationCount(),
                'lastConsultedAt' => $consultation->getLastConsultedAt()->format('Y-m-d H:i:s'),
                'createdAt' => $consultation->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $consultations);

      
        usort($data, fn($a, $b) => $b['consultationCount'] <=> $a['consultationCount']);

        return $this->json($data);
    }

   
    #[Route('/menus', name: 'api_stats_menus', methods: ['GET'])]
    public function getMenuStats(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $repository = $this->documentManager->getRepository(MenuConsultation::class);
        $consultations = $repository->findAll();

        $data = array_map(function(MenuConsultation $consultation) {
            return [
                'menuId' => $consultation->getMenuId(),
                'menuName' => $consultation->getMenuName(),
                'consultationCount' => $consultation->getConsultationCount(),
                'lastConsultedAt' => $consultation->getLastConsultedAt()->format('Y-m-d H:i:s'),
                'createdAt' => $consultation->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }, $consultations);

       
        usort($data, fn($a, $b) => $b['consultationCount'] <=> $a['consultationCount']);

        return $this->json($data);
    }

   
    #[Route('/dashboard', name: 'api_stats_dashboard', methods: ['GET'])]
    public function getDashboardStats(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

      
        $foodRepository = $this->documentManager->getRepository(FoodConsultation::class);
        $allFoods = $foodRepository->findAll();
        
        $topFoods = array_map(function(FoodConsultation $c) {
            return [
                'id' => $c->getFoodId(),
                'name' => $c->getFoodName(),
                'views' => $c->getConsultationCount(),
            ];
        }, $allFoods);
        usort($topFoods, fn($a, $b) => $b['views'] <=> $a['views']);
        $topFoods = array_slice($topFoods, 0, 10); // Top 10

      
        $menuRepository = $this->documentManager->getRepository(MenuConsultation::class);
        $allMenus = $menuRepository->findAll();
        
        $topMenus = array_map(function(MenuConsultation $c) {
            return [
                'id' => $c->getMenuId(),
                'name' => $c->getMenuName(),
                'views' => $c->getConsultationCount(),
            ];
        }, $allMenus);
        usort($topMenus, fn($a, $b) => $b['views'] <=> $a['views']);
        $topMenus = array_slice($topMenus, 0, 10);

       
        $totalFoodViews = array_sum(array_column($topFoods, 'views'));
        $totalMenuViews = array_sum(array_column($topMenus, 'views'));

        return $this->json([
            'totalFoodViews' => $totalFoodViews,
            'totalMenuViews' => $totalMenuViews,
            'topFoods' => $topFoods,
            'topMenus' => $topMenus,
        ]);
    }
}
