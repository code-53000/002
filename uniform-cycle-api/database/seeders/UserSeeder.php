<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => '系统管理员',
                'email' => 'admin@school.edu',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'real_name' => '张主任',
                'phone' => '13800138000',
                'department' => '学校总务',
                'is_active' => true,
            ],
            [
                'name' => '志愿者李妈妈',
                'email' => 'volunteer1@school.edu',
                'password' => Hash::make('volunteer123'),
                'role' => 'volunteer',
                'real_name' => '李芳',
                'phone' => '13800138001',
                'department' => '家委会',
                'is_active' => true,
            ],
            [
                'name' => '志愿者王爸爸',
                'email' => 'volunteer2@school.edu',
                'password' => Hash::make('volunteer123'),
                'role' => 'volunteer',
                'real_name' => '王伟',
                'phone' => '13800138002',
                'department' => '家委会',
                'is_active' => true,
            ],
            [
                'name' => '洗衣厂张经理',
                'email' => 'laundry@clean.com',
                'password' => Hash::make('laundry123'),
                'role' => 'laundry',
                'real_name' => '张建国',
                'phone' => '13900139001',
                'department' => '洁净洗涤有限公司',
                'is_active' => true,
            ],
            [
                'name' => '家长刘女士',
                'email' => 'parent1@school.edu',
                'password' => Hash::make('parent123'),
                'role' => 'parent',
                'real_name' => '刘红梅',
                'phone' => '13700137001',
                'department' => null,
                'is_active' => true,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
