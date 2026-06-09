<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('reservation_no', 50)->unique();
            $table->string('parent_name', 50);
            $table->string('parent_phone', 20);
            $table->string('child_name', 50);
            $table->string('child_grade', 20);
            $table->string('child_class', 20)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'picked_up', 'cancelled', 'expired'])->default('pending');
            $table->timestamp('reserved_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('distributed_by')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('distributed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
