<?php

namespace Database\Seeders;

use App\Models\UniformStyle;
use Illuminate\Database\Seeder;

class UniformStyleSeeder extends Seeder
{
    public function run(): void
    {
        $styles = [
            ['name' => '夏季短袖上衣', 'code' => 'SUM-TS-001', 'gender' => 'unisex', 'category' => 'summer', 'original_price' => 85.00, 'cycle_price' => 20.00, 'description' => '夏季校服短袖上衣，白色'],
            ['name' => '夏季短裤', 'code' => 'SUM-SH-001', 'gender' => 'male', 'category' => 'summer', 'original_price' => 65.00, 'cycle_price' => 15.00, 'description' => '夏季校服短裤，深蓝色'],
            ['name' => '夏季短裙', 'code' => 'SUM-SK-001', 'gender' => 'female', 'category' => 'summer', 'original_price' => 70.00, 'cycle_price' => 15.00, 'description' => '夏季校服短裙，苏格兰格纹'],
            ['name' => '秋季长袖上衣', 'code' => 'AUT-LS-001', 'gender' => 'unisex', 'category' => 'winter', 'original_price' => 120.00, 'cycle_price' => 30.00, 'description' => '秋季校服长袖上衣，浅灰色'],
            ['name' => '秋季长裤', 'code' => 'AUT-PT-001', 'gender' => 'unisex', 'category' => 'winter', 'original_price' => 95.00, 'cycle_price' => 25.00, 'description' => '秋季校服长裤，深蓝色'],
            ['name' => '冬季外套', 'code' => 'WIN-JK-001', 'gender' => 'unisex', 'category' => 'winter', 'original_price' => 280.00, 'cycle_price' => 60.00, 'description' => '冬季校服外套，藏青色'],
            ['name' => '冬季毛衣', 'code' => 'WIN-SW-001', 'gender' => 'unisex', 'category' => 'winter', 'original_price' => 150.00, 'cycle_price' => 35.00, 'description' => '冬季校服毛衣，灰色V领'],
            ['name' => '运动服上衣', 'code' => 'SPO-TS-001', 'gender' => 'unisex', 'category' => 'sports', 'original_price' => 100.00, 'cycle_price' => 25.00, 'description' => '运动服短袖上衣，荧光绿'],
            ['name' => '运动裤', 'code' => 'SPO-PT-001', 'gender' => 'unisex', 'category' => 'sports', 'original_price' => 85.00, 'cycle_price' => 20.00, 'description' => '运动长裤，黑色带白边'],
            ['name' => '礼服衬衫', 'code' => 'CER-SH-001', 'gender' => 'male', 'category' => 'ceremony', 'original_price' => 180.00, 'cycle_price' => 45.00, 'description' => '礼服白衬衫，长袖'],
            ['name' => '礼服衬衫', 'code' => 'CER-SH-002', 'gender' => 'female', 'category' => 'ceremony', 'original_price' => 180.00, 'cycle_price' => 45.00, 'description' => '礼服白衬衫，长袖收腰'],
            ['name' => '礼服西装外套', 'code' => 'CER-JK-001', 'gender' => 'unisex', 'category' => 'ceremony', 'original_price' => 350.00, 'cycle_price' => 80.00, 'description' => '礼服西装外套，黑色'],
            ['name' => '领结/领花', 'code' => 'CER-ACC-001', 'gender' => 'unisex', 'category' => 'ceremony', 'original_price' => 45.00, 'cycle_price' => 10.00, 'description' => '礼服领结/领花，红色'],
        ];

        foreach ($styles as $style) {
            UniformStyle::create($style);
        }
    }
}
