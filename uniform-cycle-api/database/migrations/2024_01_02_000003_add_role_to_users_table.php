<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'volunteer', 'laundry', 'parent'])->default('volunteer');
            $table->string('phone', 20)->nullable();
            $table->string('real_name', 50)->nullable();
            $table->string('department', 100)->nullable();
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'real_name', 'department', 'is_active']);
        });
    }
};
