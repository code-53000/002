<?php

namespace Database\Seeders;

use App\Models\UniformSize;
use Illuminate\Database\Seeder;

class UniformSizeSeeder extends Seeder
{
    public function run(): void
    {
        $sizes = [
            ['size_label' => '110', 'size_group' => 'child', 'sort_order' => 1, 'height_min' => 105, 'height_max' => 115, 'description' => '适合身高105-115cm'],
            ['size_label' => '120', 'size_group' => 'child', 'sort_order' => 2, 'height_min' => 115, 'height_max' => 125, 'description' => '适合身高115-125cm'],
            ['size_label' => '130', 'size_group' => 'child', 'sort_order' => 3, 'height_min' => 125, 'height_max' => 135, 'description' => '适合身高125-135cm'],
            ['size_label' => '140', 'size_group' => 'child', 'sort_order' => 4, 'height_min' => 135, 'height_max' => 145, 'description' => '适合身高135-145cm'],
            ['size_label' => '150', 'size_group' => 'child', 'sort_order' => 5, 'height_min' => 145, 'height_max' => 155, 'description' => '适合身高145-155cm'],
            ['size_label' => '160', 'size_group' => 'child', 'sort_order' => 6, 'height_min' => 155, 'height_max' => 165, 'description' => '适合身高155-165cm'],
            ['size_label' => '170', 'size_group' => 'teen', 'sort_order' => 7, 'height_min' => 165, 'height_max' => 175, 'description' => '适合身高165-175cm'],
            ['size_label' => '180', 'size_group' => 'teen', 'sort_order' => 8, 'height_min' => 175, 'height_max' => 185, 'description' => '适合身高175-185cm'],
            ['size_label' => 'S', 'size_group' => 'adult', 'sort_order' => 9, 'description' => '成人小号'],
            ['size_label' => 'M', 'size_group' => 'adult', 'sort_order' => 10, 'description' => '成人中号'],
            ['size_label' => 'L', 'size_group' => 'adult', 'sort_order' => 11, 'description' => '成人大号'],
            ['size_label' => 'XL', 'size_group' => 'adult', 'sort_order' => 12, 'description' => '成人加大号'],
        ];

        foreach ($sizes as $size) {
            UniformSize::create($size);
        }
    }
}
