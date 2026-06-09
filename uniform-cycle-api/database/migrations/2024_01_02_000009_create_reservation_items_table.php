<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reservation_id');
            $table->unsignedBigInteger('inventory_id')->nullable();
            $table->unsignedBigInteger('style_id');
            $table->unsignedBigInteger('size_id');
            $table->integer('quantity')->default(1);
            $table->enum('status', ['pending', 'allocated', 'picked_up', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('reservation_id')->references('id')->on('reservations')->onDelete('cascade');
            $table->foreign('inventory_id')->references('id')->on('inventory')->onDelete('set null');
            $table->foreign('style_id')->references('id')->on('uniform_styles');
            $table->foreign('size_id')->references('id')->on('uniform_sizes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_items');
    }
};
